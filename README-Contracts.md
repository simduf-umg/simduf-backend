# 🏥 Sistema de Gestión Farmacéutica - Deploy & Interact

## 📋 Descripción General

Este sistema blockchain incluye tres contratos inteligentes para la gestión integral de una farmacia:

1. **InventoryManager**: Control de inventario con alertas de stock
2. **LotTracking**: Trazabilidad de lotes y control de vencimientos
3. **OrderRegistry**: Registro y seguimiento de pedidos

## 🚀 Deploy de Contratos

### Prerequisitos
```bash
# Asegúrate de tener Hardhat instalado
npm install --save-dev hardhat

# Instala las dependencias necesarias
npm install --save-dev @openzeppelin/contracts
```

### Iniciar nodo local de Hardhat
```bash
npx hardhat node
```

### Deploy individual
```bash
# Deploy InventoryManager
npx hardhat run scripts/deploy/01_deploy_inventory_manager.js --network localhost

# Deploy LotTracking
npx hardhat run scripts/deploy/02_deploy_lot_tracking.js --network localhost

# Deploy OrderRegistry
npx hardhat run scripts/deploy/03_deploy_order_registry.js --network localhost
```

### Deploy completo (recomendado)
```bash
# Despliega todos los contratos en orden
npx hardhat run scripts/deploy/deploy-all.js --network localhost
```

Las direcciones de los contratos desplegados se guardan automáticamente en `deployed-addresses.json`.

## 🎮 Interacción con Contratos

### Ejecutar demos individuales

#### Demo de Inventario
```bash
npx hardhat run scripts/interact/interact-inventory-manager.js --network localhost
```
Esta demo muestra:
- Configuración de umbrales de stock (mínimo/máximo)
- Agregar stock con información de lotes
- Verificar estados del inventario (Verde/Amarillo/Rojo)
- Simular consumo de medicamentos
- Consultar historial de lotes

#### Demo de Trazabilidad
```bash
npx hardhat run scripts/interact/interact-lot-tracking.js --network localhost
```
Esta demo incluye:
- Registro de lotes con fechas de fabricación y vencimiento
- Transferencias a través de la cadena de suministro
- Alertas de vencimiento próximo
- Validación de lotes vencidos

#### Demo de Pedidos
```bash
npx hardhat run scripts/interact/interact-order-registry.js --network localhost
```
Esta demo presenta:
- Registro de nuevos pedidos
- Actualización de estados (Registrado → Despachado → En Tránsito → Entregado)
- Consulta de historial completo
- Validaciones de seguridad

### Ejecutar demo completa
```bash
# Ejecuta todas las demos en secuencia
npx hardhat run scripts/interact/interact-all.js --network localhost
```

## 📊 Estructura de Scripts

```
scripts/
├── deploy/
│   ├── 01_deploy_inventory_manager.js
│   ├── 02_deploy_lot_tracking.js
│   ├── 03_deploy_order_registry.js
│   └── deploy-all.js
└── interact/
    ├── interact-inventory-manager.js
    ├── interact-lot-tracking.js
    ├── interact-order-registry.js
    └── interact-all.js
```

## 🔧 Personalización

### Modificar parámetros de inventario
En `interact-inventory-manager.js`, puedes ajustar:
- Umbrales de stock mínimo y máximo
- Ubicaciones de farmacias
- Tipos de medicamentos
- Cantidades iniciales

### Ajustar vencimientos
En `interact-lot-tracking.js`, modifica:
- Fechas de fabricación y vencimiento
- Umbral de alerta de vencimiento (por defecto 7 días)
- Rutas de distribución

### Configurar estados de pedidos
En `interact-order-registry.js`, personaliza:
- Estados disponibles
- Flujo de trabajo de pedidos
- Permisos de actualización

## 🛡️ Características de Seguridad

- **Control de acceso**: Solo managers autorizados pueden modificar inventario
- **Validación de datos**: Verificación de cantidades y fechas
- **Prevención de errores**: No permite transferir lotes vencidos
- **Trazabilidad completa**: Registro inmutable de todas las operaciones

## 📝 Notas Importantes

1. **Red local**: Estos scripts están configurados para `localhost`. Para otras redes, modifica el parámetro `--network`.

2. **Gas**: En una red local no hay costos de gas, pero en redes reales deberás tener fondos suficientes.

3. **Direcciones**: El archivo `deployed-addresses.json` es crucial para la interacción. No lo elimines después del deploy.

4. **Cuentas**: Los scripts usan las primeras 4 cuentas de Hardhat:
   - Cuenta 0: Owner/Deployer
   - Cuenta 1: Manager 1
   - Cuenta 2: Manager 2
   - Cuenta 3: Cliente

## 🐛 Solución de Problemas

### Error: "Contract not deployed"
- Asegúrate de haber ejecutado los scripts de deploy primero
- Verifica que `deployed-addresses.json` existe y contiene las direcciones

### Error: "Not authorized"
- Verifica que estás usando la cuenta correcta (owner o manager)
- Revisa que el manager esté autorizado en el contrato

### Error: "Insufficient stock"
- Agrega más stock antes de intentar removerlo
- Verifica las cantidades disponibles con `getStock()`

