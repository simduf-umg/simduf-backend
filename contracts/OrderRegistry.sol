// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract OrderRegistry {
    enum Status { Registrado, Despachado, EnTransito, Entregado }

    struct Estado {
        Status estado;
        uint timestamp;
    }

    struct Pedido {
        address cliente;
        uint fecha;
        Estado[] historial;
    }

    mapping(bytes32 => Pedido) public pedidos;
    address public owner;

    event PedidoRegistrado(bytes32 indexed id, address indexed cliente, uint fecha);
    event EstadoActualizado(bytes32 indexed id, Status nuevoEstado, uint timestamp);

    modifier soloOwner() {
        require(msg.sender == owner, "No autorizado");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function registrarPedido(bytes32 id) external {
        require(pedidos[id].cliente == address(0), "Pedido ya existe");
        Pedido storage nuevo = pedidos[id];
        nuevo.cliente = msg.sender;
        nuevo.fecha = block.timestamp;
        nuevo.historial.push(Estado(Status.Registrado, block.timestamp));

        emit PedidoRegistrado(id, msg.sender, block.timestamp);
    }

    function actualizarEstado(bytes32 id, Status nuevoEstado) external soloOwner {
        require(pedidos[id].cliente != address(0), "Pedido no existe");
        pedidos[id].historial.push(Estado(nuevoEstado, block.timestamp));
        emit EstadoActualizado(id, nuevoEstado, block.timestamp);
    }

    function obtenerEstadoActual(bytes32 id) external view returns (Status, uint) {
        require(pedidos[id].cliente != address(0), "Pedido no existe");
        Estado memory estadoActual = pedidos[id].historial[pedidos[id].historial.length - 1];
        return (estadoActual.estado, estadoActual.timestamp);
    }

    function obtenerHistorial(bytes32 id) external view returns (Estado[] memory) {
        require(pedidos[id].cliente != address(0), "Pedido no existe");
        return pedidos[id].historial;
    }
}
