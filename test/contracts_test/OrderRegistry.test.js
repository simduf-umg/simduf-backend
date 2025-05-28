const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("OrderRegistry", function () {
    let orderRegistry;
    let owner;
    let cliente1;
    let cliente2;
    let otroUsuario;

    // IDs de pedidos para las pruebas
    const pedidoId1 = ethers.keccak256(ethers.toUtf8Bytes("pedido1"));
    const pedidoId2 = ethers.keccak256(ethers.toUtf8Bytes("pedido2"));
    const pedidoIdInexistente = ethers.keccak256(ethers.toUtf8Bytes("inexistente"));

    // Estados del enum
    const Status = {
        Registrado: 0,
        Despachado: 1,
        EnTransito: 2,
        Entregado: 3
    };

    beforeEach(async function () {
        [owner, cliente1, cliente2, otroUsuario] = await ethers.getSigners();
        
        const OrderRegistry = await ethers.getContractFactory("OrderRegistry");
        orderRegistry = await OrderRegistry.deploy();
        await orderRegistry.waitForDeployment();
    });

    describe("Deployment", function () {
        it("Debe establecer el owner correcto", async function () {
            expect(await orderRegistry.owner()).to.equal(owner.address);
        });
    });

    describe("Registro de Pedidos", function () {
        it("Debe permitir registrar un nuevo pedido", async function () {
            const tx = await orderRegistry.connect(cliente1).registrarPedido(pedidoId1);
            
            // Verificar que se emitió el evento
            await expect(tx)
                .to.emit(orderRegistry, "PedidoRegistrado")
                .withArgs(pedidoId1, cliente1.address, await obtenerTimestamp(tx));

            // Verificar que el pedido se guardó correctamente
            const pedido = await orderRegistry.pedidos(pedidoId1);
            expect(pedido.cliente).to.equal(cliente1.address);
            expect(pedido.fecha).to.be.gt(0);
        });

        it("Debe crear el historial inicial con estado Registrado", async function () {
            await orderRegistry.connect(cliente1).registrarPedido(pedidoId1);
            
            const [estado, timestamp] = await orderRegistry.obtenerEstadoActual(pedidoId1);
            expect(estado).to.equal(Status.Registrado);
            expect(timestamp).to.be.gt(0);
        });

        it("No debe permitir registrar un pedido con ID duplicado", async function () {
            await orderRegistry.connect(cliente1).registrarPedido(pedidoId1);
            
            await expect(
                orderRegistry.connect(cliente2).registrarPedido(pedidoId1)
            ).to.be.revertedWith("Pedido ya existe");
        });

        it("Debe permitir que diferentes clientes registren pedidos diferentes", async function () {
            await orderRegistry.connect(cliente1).registrarPedido(pedidoId1);
            await orderRegistry.connect(cliente2).registrarPedido(pedidoId2);

            const pedido1 = await orderRegistry.pedidos(pedidoId1);
            const pedido2 = await orderRegistry.pedidos(pedidoId2);

            expect(pedido1.cliente).to.equal(cliente1.address);
            expect(pedido2.cliente).to.equal(cliente2.address);
        });
    });

    describe("Actualización de Estados", function () {
        beforeEach(async function () {
            await orderRegistry.connect(cliente1).registrarPedido(pedidoId1);
        });

        it("Debe permitir al owner actualizar el estado", async function () {
            const tx = await orderRegistry.connect(owner).actualizarEstado(pedidoId1, Status.Despachado);
            
            await expect(tx)
                .to.emit(orderRegistry, "EstadoActualizado")
                .withArgs(pedidoId1, Status.Despachado, await obtenerTimestamp(tx));

            const [estado] = await orderRegistry.obtenerEstadoActual(pedidoId1);
            expect(estado).to.equal(Status.Despachado);
        });

        it("No debe permitir a usuarios no autorizados actualizar el estado", async function () {
            await expect(
                orderRegistry.connect(cliente1).actualizarEstado(pedidoId1, Status.Despachado)
            ).to.be.revertedWith("No autorizado");

            await expect(
                orderRegistry.connect(otroUsuario).actualizarEstado(pedidoId1, Status.Despachado)
            ).to.be.revertedWith("No autorizado");
        });

        it("No debe permitir actualizar el estado de un pedido inexistente", async function () {
            await expect(
                orderRegistry.connect(owner).actualizarEstado(pedidoIdInexistente, Status.Despachado)
            ).to.be.revertedWith("Pedido no existe");
        });

        it("Debe mantener el historial de estados correctamente", async function () {
            // Actualizar a varios estados
            await orderRegistry.connect(owner).actualizarEstado(pedidoId1, Status.Despachado);
            await orderRegistry.connect(owner).actualizarEstado(pedidoId1, Status.EnTransito);
            await orderRegistry.connect(owner).actualizarEstado(pedidoId1, Status.Entregado);

            // Verificar estado actual
            const [estadoActual] = await orderRegistry.obtenerEstadoActual(pedidoId1);
            expect(estadoActual).to.equal(Status.Entregado);

            // Verificar historial completo
            const historial = await orderRegistry.obtenerHistorial(pedidoId1);
            expect(historial).to.have.length(4); // Registrado + 3 actualizaciones

            expect(historial[0].estado).to.equal(Status.Registrado);
            expect(historial[1].estado).to.equal(Status.Despachado);
            expect(historial[2].estado).to.equal(Status.EnTransito);
            expect(historial[3].estado).to.equal(Status.Entregado);

            // Verificar que los timestamps están en orden
            for (let i = 1; i < historial.length; i++) {
                expect(historial[i].timestamp).to.be.gte(historial[i-1].timestamp);
            }
        });
    });

    describe("Consulta de Estados", function () {
        beforeEach(async function () {
            await orderRegistry.connect(cliente1).registrarPedido(pedidoId1);
        });

        it("Debe retornar el estado actual correctamente", async function () {
            const [estado, timestamp] = await orderRegistry.obtenerEstadoActual(pedidoId1);
            
            expect(estado).to.equal(Status.Registrado);
            expect(timestamp).to.be.gt(0);
        });

        it("No debe permitir consultar el estado de un pedido inexistente", async function () {
            await expect(
                orderRegistry.obtenerEstadoActual(pedidoIdInexistente)
            ).to.be.revertedWith("Pedido no existe");
        });

        it("Debe retornar el historial completo", async function () {
            // Agregar algunos estados
            await orderRegistry.connect(owner).actualizarEstado(pedidoId1, Status.Despachado);
            await orderRegistry.connect(owner).actualizarEstado(pedidoId1, Status.EnTransito);

            const historial = await orderRegistry.obtenerHistorial(pedidoId1);
            
            expect(historial).to.have.length(3);
            expect(historial[0].estado).to.equal(Status.Registrado);
            expect(historial[1].estado).to.equal(Status.Despachado);
            expect(historial[2].estado).to.equal(Status.EnTransito);
        });

        it("No debe permitir consultar el historial de un pedido inexistente", async function () {
            await expect(
                orderRegistry.obtenerHistorial(pedidoIdInexistente)
            ).to.be.revertedWith("Pedido no existe");
        });
    });

    describe("Casos Edge", function () {
        it("Debe manejar correctamente múltiples pedidos simultáneos", async function () {
            const pedidoIds = [];
            const clientes = [cliente1, cliente2, otroUsuario];
            
            // Registrar múltiples pedidos
            for (let i = 0; i < clientes.length; i++) {
                const id = ethers.keccak256(ethers.toUtf8Bytes(`pedido${i}`));
                pedidoIds.push(id);
                await orderRegistry.connect(clientes[i]).registrarPedido(id);
            }

            // Verificar que todos los pedidos se registraron correctamente
            for (let i = 0; i < pedidoIds.length; i++) {
                const pedido = await orderRegistry.pedidos(pedidoIds[i]);
                expect(pedido.cliente).to.equal(clientes[i].address);
                
                const [estado] = await orderRegistry.obtenerEstadoActual(pedidoIds[i]);
                expect(estado).to.equal(Status.Registrado);
            }
        });

        it("Debe permitir actualizar estados en cualquier orden", async function () {
            await orderRegistry.connect(cliente1).registrarPedido(pedidoId1);
            
            // Saltar directamente a Entregado sin pasar por los estados intermedios
            await orderRegistry.connect(owner).actualizarEstado(pedidoId1, Status.Entregado);
            
            const [estado] = await orderRegistry.obtenerEstadoActual(pedidoId1);
            expect(estado).to.equal(Status.Entregado);
        });

        it("Debe manejar correctamente el mismo cliente registrando múltiples pedidos", async function () {
            const id1 = ethers.keccak256(ethers.toUtf8Bytes("pedido_cliente1_1"));
            const id2 = ethers.keccak256(ethers.toUtf8Bytes("pedido_cliente1_2"));
            
            await orderRegistry.connect(cliente1).registrarPedido(id1);
            await orderRegistry.connect(cliente1).registrarPedido(id2);

            const pedido1 = await orderRegistry.pedidos(id1);
            const pedido2 = await orderRegistry.pedidos(id2);

            expect(pedido1.cliente).to.equal(cliente1.address);
            expect(pedido2.cliente).to.equal(cliente1.address);
            expect(pedido1.fecha).to.not.equal(pedido2.fecha);
        });
    });

    describe("Eventos", function () {
        it("Debe emitir PedidoRegistrado con los parámetros correctos", async function () {
            const tx = await orderRegistry.connect(cliente1).registrarPedido(pedidoId1);
            const timestamp = await obtenerTimestamp(tx);

            await expect(tx)
                .to.emit(orderRegistry, "PedidoRegistrado")
                .withArgs(pedidoId1, cliente1.address, timestamp);
        });

        it("Debe emitir EstadoActualizado con los parámetros correctos", async function () {
            await orderRegistry.connect(cliente1).registrarPedido(pedidoId1);
            
            const tx = await orderRegistry.connect(owner).actualizarEstado(pedidoId1, Status.Despachado);
            const timestamp = await obtenerTimestamp(tx);

            await expect(tx)
                .to.emit(orderRegistry, "EstadoActualizado")
                .withArgs(pedidoId1, Status.Despachado, timestamp);
        });
    });

    // Función auxiliar para obtener el timestamp de una transacción
    async function obtenerTimestamp(tx) {
        const receipt = await tx.wait();
        const block = await ethers.provider.getBlock(receipt.blockNumber);
        return block.timestamp;
    }
});