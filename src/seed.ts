import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RolesService } from './modules/roles/services/roles.service';
import { PersonasService } from './modules/personas/services/personas.service';
import { UsuariosService } from './modules/usuarios/services/usuarios.service';
import { DepartamentosService } from './modules/departamentos/services/departamentos.service';
import { MunicipiosService } from './modules/municipios/services/municipios.service';
import { DistritosService } from './modules/distritos/services/distritos.service';
import { ConcentracionesService } from './modules/concentraciones/services/concentraciones.service';
import { PresentacionesService } from './modules/presentaciones/services/presentaciones.service';
import { MedicamentosService } from './modules/medicamentos/services/medicamentos.service';
import { LotesService } from './modules/lotes/services/lotes.service';
import { InventariosService } from './modules/inventarios/services/inventarios.service';
import { PedidosService } from './modules/pedidos/services/pedidos.service';
import { DetallePedidosService } from './modules/detalle-pedidos/services/detalle-pedidos.service';
import { MovimientosService } from './modules/movimientos/services/movimientos.service';
import { AsignacionUsuarioService } from './modules/asignacion-usuarios/services/asignacion-usuarios.service';
import { SeguimientosService } from './modules/seguimientos/services/seguimientos.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    console.log('Iniciando proceso de semilla de datos...');

    // Servicios
    const rolesService = app.get(RolesService);
    const personasService = app.get(PersonasService);
    const usuariosService = app.get(UsuariosService);
    const departamentosService = app.get(DepartamentosService);
    const municipiosService = app.get(MunicipiosService);
    const distritosService = app.get(DistritosService);
    const concentracionesService = app.get(ConcentracionesService);
    const presentacionesService = app.get(PresentacionesService);
    const medicamentosService = app.get(MedicamentosService); 
    const lotesService = app.get(LotesService);
    const inventariosService = app.get(InventariosService);
    const pedidosService = app.get(PedidosService);
    const detallePedidosService = app.get(DetallePedidosService);
    const movimientosService = app.get(MovimientosService);
    const asignacionUsuarioService = app.get(AsignacionUsuarioService);
    const seguimientosService = app.get(SeguimientosService);

    // Crear roles
    console.log('Creando roles...');
    const adminRol = await rolesService.create({ nombre_rol: 'ADMIN' });
    const userRol = await rolesService.create({ nombre_rol: 'USER' });
    console.log(`Roles creados: ${adminRol.nombre_rol}, ${userRol.nombre_rol}`);

    // Crear persona admin
    console.log('Creando persona admin...');
    const adminPersona = await personasService.create({
      nombre: 'Admin',
      apellido: 'Sistema',
      fecha_nacimiento: '1990-01-01',
    });
    console.log(`Persona admin creada: ${adminPersona.nombre} ${adminPersona.apellido}`);

    // Crear usuario admin
    console.log('Creando usuario admin...');
    const adminUsuario = await usuariosService.create({
      username: 'admin',
      correo: 'tulioalejandroquintana@gmail.com',
      contrasena: 'Admin123!',
      id_persona: adminPersona.id_persona,
      activo: true,
      rolIds: [adminRol.id_rol],
    });
    console.log(`Usuario admin creado: ${adminUsuario.username}`);

    // Crear persona usuario
    console.log('Creando persona usuario normal...');
    const userPersona = await personasService.create({
      nombre: 'Usuario',
      apellido: 'Normal',
      fecha_nacimiento: '1995-05-15',
    });
    console.log(`Persona usuario creada: ${userPersona.nombre} ${userPersona.apellido}`);

    // Crear usuario normal
    console.log('Creando usuario normal...');
    const usuario = await usuariosService.create({
      username: 'usuario',
      correo: 'usuario@simduf.com',
      contrasena: 'Usuario123!',
      id_persona: userPersona.id_persona,
      activo: true,
      rolIds: [userRol.id_rol],
    });
    console.log(`Usuario normal creado: ${usuario.username}`);

    console.log('Creando departamentos...');
    const departamentos = [
      'Guatemala',
      'El Progreso', 
      'Sacatepéquez',
      'Chimaltenango',
      'Escuintla',
      'Santa Rosa',
      'Sololá',
      'Totonicapán',
      'Quetzaltenango',
      'Suchitepéquez',
      'Retalhuleu',
      'San Marcos',
      'Huehuetenango',
      'Quiché',
      'Baja Verapaz',
      'Alta Verapaz',
      'Petén',
      'Izabal',
      'Zacapa',
      'Chiquimula',
      'Jalapa',
      'Jutiapa'
    ];

    for (const nombreDepartamento of departamentos) {
      await departamentosService.create({ nombre: nombreDepartamento });
    }
    console.log(`${departamentos.length} departamentos creados`);

    console.log('Creando municipios...');
    
    const municipiosPorDepartamento = {
      'Guatemala': [
        'Guatemala', 'Santa Catarina Pinula', 'San José Pinula', 'San José del Golfo',
        'Palencia', 'Chinautla', 'San Pedro Ayampuc', 'Mixco', 'San Pedro Sacatepéquez',
        'San Juan Sacatepéquez', 'San Raymundo', 'Chuarrancho', 'Fraijanes', 'Amatitlán',
        'Villa Nueva', 'Villa Canales', 'San Miguel Petapa'
      ],
      'El Progreso': [
        'Guastatoya', 'Morazán', 'San Agustín Acasaguastlán', 'San Cristóbal Acasaguastlán',
        'El Jícaro', 'Sansare', 'Sanarate', 'San Antonio La Paz'
      ],
      'Sacatepéquez': [
        'Antigua Guatemala', 'Jocotenango', 'Pastores', 'Sumpango', 'Santo Domingo Xenacoj',
        'Santiago Sacatepéquez', 'San Bartolomé Milpas Altas', 'San Lucas Sacatepéquez',
        'Santa Lucía Milpas Altas', 'Magdalena Milpas Altas', 'Santa María de Jesús',
        'Ciudad Vieja', 'San Miguel Dueñas', 'Alotenango', 'San Antonio Aguas Calientes',
        'Santa Catarina Barahona'
      ],
      'Chimaltenango': [
        'Chimaltenango', 'San José Poaquil', 'San Martín Jilotepeque', 'San Juan Comalapa',
        'Santa Apolonia', 'Tecpán Guatemala', 'Patzún', 'Pochuta', 'Patzicía', 'Santa Cruz Balanyá',
        'Acatenango', 'Yepocapa', 'San Andrés Itzapa', 'Parramos', 'Zaragoza', 'El Tejar'
      ],
      'Escuintla': [
        'Escuintla', 'Santa Lucía Cotzumalguapa', 'La Democracia', 'Siquinalá', 'Masagua',
        'Tiquisate', 'La Gomera', 'Guanagazapa', 'San José', 'Iztapa', 'Palín', 'San Vicente Pacaya',
        'Nueva Concepción'
      ],
      'Santa Rosa': [
        'Cuilapa', 'Barberena', 'Santa Rosa de Lima', 'Casillas', 'San Rafael Las Flores',
        'Oratorio', 'San Juan Tecuaco', 'Chiquimulilla', 'Taxisco', 'Santa María Ixhuatán',
        'Guazacapán', 'Santa Cruz Naranjo', 'Pueblo Nuevo Viñas', 'Nueva Santa Rosa'
      ],
      'Sololá': [
        'Sololá', 'San José Chacayá', 'Santa María Visitación', 'Santa Lucía Utatlán',
        'Nahualá', 'Santa Catarina Ixtahuacán', 'Santa Clara La Laguna', 'Concepción',
        'San Andrés Semetabaj', 'Panajachel', 'Santa Catarina Palopó', 'San Antonio Palopó',
        'San Lucas Tolimán', 'Santa Cruz La Laguna', 'San Pablo La Laguna', 'San Marcos La Laguna',
        'San Juan La Laguna', 'San Pedro La Laguna', 'Santiago Atitlán'
      ],
      'Totonicapán': [
        'Totonicapán', 'San Cristóbal Totonicapán', 'San Francisco El Alto', 'San Andrés Xecul',
        'Momostenango', 'Santa María Chiquimula', 'Santa Lucía La Reforma', 'San Bartolo'
      ],
      'Quetzaltenango': [
        'Quetzaltenango', 'Salcajá', 'Olintepeque', 'San Carlos Sija', 'Sibilia', 'Cabricán',
        'Cajolá', 'San Miguel Sigüilá', 'Ostuncalco', 'San Mateo', 'Concepción Chiquirichapa',
        'San Martín Sacatepéquez', 'Almolonga', 'Cantel', 'Huitán', 'Zunil', 'Colomba',
        'San Francisco La Unión', 'El Palmar', 'Coatepeque', 'Génova', 'Flores Costa Cuca',
        'La Esperanza', 'Palestina de Los Altos'
      ],
      'Suchitepéquez': [
        'Mazatenango', 'Cuyotenango', 'San Francisco Zapotitlán', 'San Bernardino',
        'San José El Ídolo', 'Santo Domingo Suchitepéquez', 'San Lorenzo', 'Samayac',
        'San Pablo Jocopilas', 'San Antonio Suchitepéquez', 'San Miguel Panán', 'San Gabriel',
        'Chicacao', 'Patulul', 'Santa Bárbara', 'San Juan Bautista', 'Santo Tomás La Unión',
        'Zunilito', 'Pueblo Nuevo', 'Río Bravo'
      ],
      'Retalhuleu': [
        'Retalhuleu', 'San Sebastián', 'Santa Cruz Muluá', 'San Martín Zapotitlán',
        'San Felipe', 'San Andrés Villa Seca', 'Champerico', 'Nuevo San Carlos',
        'El Asintal'
      ],
      'San Marcos': [
        'San Marcos', 'San Pedro Sacatepéquez', 'San Antonio Sacatepéquez', 'Comitancillo',
        'San Miguel Ixtahuacán', 'Concepción Tutuapa', 'Tacaná', 'Sibinal', 'Tajumulco',
        'Tejutla', 'San Rafael Pie de la Cuesta', 'Nuevo Progreso', 'El Tumbador',
        'El Rodeo', 'Malacatán', 'Catarina', 'Ayutla', 'Ocós', 'San Pablo', 'El Quetzal',
        'La Reforma', 'Pajapita', 'Ixchiguán', 'San José Ojetenam', 'San Cristóbal Cucho',
        'Sipacapa', 'Esquipulas Palo Gordo', 'Río Blanco', 'San Lorenzo'
      ],
      'Huehuetenango': [
        'Huehuetenango', 'Chiantla', 'Malacatancito', 'Cuilco', 'Nentón', 'San Pedro Necta',
        'Jacaltenango', 'San Pedro Soloma', 'San Ildefonso Ixtahuacán', 'Santa Bárbara',
        'La Libertad', 'La Democracia', 'San Miguel Acatán', 'San Rafael La Independencia',
        'Todos Santos Cuchumatán', 'San Juan Atitán', 'Santa Eulalia', 'San Mateo Ixtatán',
        'Colotenango', 'San Sebastián Huehuetenango', 'Tectitán', 'Concepción Huista',
        'San Juan Ixcoy', 'San Antonio Huista', 'San Sebastián Coatán', 'Santa Cruz Barillas',
        'Aguacatán', 'San Rafael Petzal', 'San Gaspar Ixchil', 'Santiago Chimaltenango',
        'Santa Ana Huista'
      ],
      'Quiché': [
        'Santa Cruz del Quiché', 'Chiché', 'Chinique', 'Zacualpa', 'Chajul', 'Santo Tomás Chichicastenango',
        'Patzité', 'San Antonio Ilotenango', 'San Pedro Jocopilas', 'Cunén', 'San Juan Cotzal',
        'Joyabaj', 'Nebaj', 'San Andrés Sajcabajá', 'San Miguel Uspantán', 'Sacapulas',
        'San Bartolomé Jocotenango', 'Canillá', 'Chicamán', 'Playa Grande Ixcán', 'Pachalum'
      ],
      'Baja Verapaz': [
        'Salamá', 'San Miguel Chicaj', 'Rabinal', 'Cubulco', 'Granados', 'Santa Cruz el Chol',
        'San Jerónimo', 'Purulhá'
      ],
      'Alta Verapaz': [
        'Cobán', 'Santa Cruz Verapaz', 'San Cristóbal Verapaz', 'Tactic', 'Tamahú',
        'Tucurú', 'Panzós', 'Senahú', 'San Pedro Carchá', 'San Juan Chamelco',
        'Lanquín', 'Santa María Cahabón', 'Chisec', 'Chahal', 'Fray Bartolomé de las Casas',
        'La Tinta', 'Raxruhá'
      ],
      'Petén': [
        'Flores', 'San José', 'San Benito', 'San Andrés', 'La Libertad', 'San Francisco',
        'Santa Ana', 'Dolores', 'San Luis', 'Sayaxché', 'Melchor de Mencos', 'Poptún',
        'Las Cruces', 'El Chal'
      ],
      'Izabal': [
        'Puerto Barrios', 'Livingston', 'El Estor', 'Morales', 'Los Amates'
      ],
      'Zacapa': [
        'Zacapa', 'Estanzuela', 'Río Hondo', 'Gualán', 'Teculután', 'Usumatlán',
        'Cabañas', 'San Diego', 'La Unión', 'Huité'
      ],
      'Chiquimula': [
        'Chiquimula', 'San José La Arada', 'San Juan Ermita', 'Jocotán', 'Camotán',
        'Olopa', 'Esquipulas', 'Concepción Las Minas', 'Quezaltepeque', 'San Jacinto',
        'Ipala'
      ],
      'Jalapa': [
        'Jalapa', 'San Pedro Pinula', 'San Luis Jilotepeque', 'San Manuel Chaparrón',
        'San Carlos Alzatate', 'Monjas', 'Mataquescuintla'
      ],
      'Jutiapa': [
        'Jutiapa', 'El Progreso', 'Santa Catarina Mita', 'Agua Blanca', 'Asunción Mita',
        'Yupiltepeque', 'Atescatempa', 'Jerez', 'El Adelanto', 'Zapotitlán', 'Comapa',
        'Jalpatagua', 'Conguaco', 'Moyuta', 'Pasaco', 'San José Acatempa', 'Quesada'
      ]
    };

    let totalMunicipios = 0;
    
    for (const [nombreDepartamento, municipios] of Object.entries(municipiosPorDepartamento)) {
      // Buscar el departamento por nombre
      const departamentos = await departamentosService.findAll();
      const departamento = departamentos.find(dep => dep.nombre === nombreDepartamento);
      
      if (departamento) {
        console.log(`Creando ${municipios.length} municipios para ${nombreDepartamento}...`);
        
        for (const nombreMunicipio of municipios) {
          await municipiosService.create({
            nombre: nombreMunicipio,
            id_departamento: departamento.id_departamento,
          });
        }
        
        totalMunicipios += municipios.length;
      } else {
        console.warn(`Departamento ${nombreDepartamento} no encontrado`);
      }
    }
    
    console.log(`Total de ${totalMunicipios} municipios creados en todos los departamentos`);

    console.log('Creando distritos...');

    const distritosEjemplo = [ 
      // Distritos de Jutiapa
      { nombre: 'Distrito municipal de Jutiapa', municipio: 'Jutiapa' },
      
      // Distritos de El Progreso
      { nombre: 'Distrito municipal de El Progreso', municipio: 'El Progreso' },
      
      // Distritos de Asunción Mita
      { nombre: 'Distrito municipal de Asunción Mita', municipio: 'Asunción Mita' },

      // Distritos de Jalapa
      { nombre: 'Distrito municipal de Jalapa', municipio: 'Jalapa' },
    ];

    // Obtener todos los municipios para poder hacer la relación
    const todosMunicipios = await municipiosService.findAll();

    for (const distritoInfo of distritosEjemplo) {
      const municipio = todosMunicipios.find(m => m.nombre === distritoInfo.municipio);
      if (municipio) {
        await distritosService.create({
          nombre: distritoInfo.nombre,
          id_municipio: municipio.id_municipio,
        });
      }
    }

    console.log(`${distritosEjemplo.length} distritos creados`);


    console.log('Creando concentraciones...');

    const concentraciones = [
      { valor: 100, unidad_medida: 'mg' },
      { valor: 200, unidad_medida: 'mg' },
      { valor: 500, unidad_medida: 'mg' },
      { valor: 1, unidad_medida: 'g' },
      { valor: 10, unidad_medida: 'mg/ml' },
      { valor: 20, unidad_medida: 'mg/ml' },
      { valor: 50, unidad_medida: 'mg/ml' },
      { valor: 100, unidad_medida: 'mg/ml' }
    ];

    for (const concentracion of concentraciones) {
      await concentracionesService.create(concentracion);
    }
    console.log(`${concentraciones.length} concentraciones creadas`);

    console.log('Creando presentaciones...');

    const presentaciones = [
      { nombre: 'Tableta', descripcion: 'Tableta de medicamento' },
      { nombre: 'Jarabe', descripcion: 'Jarabe de medicamento' },
      { nombre: 'Inyección', descripcion: 'Inyección de medicamento' },
      { nombre: 'Crema', descripcion: 'Crema de medicamento' },
      { nombre: 'Gotas', descripcion: 'Gotas de medicamento' },
      { nombre: 'Supositorio', descripcion: 'Supositorio de medicamento' },
      { nombre: 'Polvo', descripcion: 'Polvo de medicamento' },
      { nombre: 'Solución', descripcion: 'Solución de medicamento' }
    ];

    for (const presentacion of presentaciones) {
      await presentacionesService.create(presentacion);
    }
    console.log(`${presentaciones.length} presentaciones creadas`);

    console.log('Creando medicamentos...');

    const medicamentos = [
      {
        nombre: 'Paracetamol',
        codigo: 'PARA001',
        descripcion: 'Analgésico y antipirético',
        concentracionId: 1, // 100mg
        presentacionId: 1 // Tableta
      },
      {
        nombre: 'Ibuprofeno',
        codigo: 'IBUP001',
        descripcion: 'Antiinflamatorio no esteroideo',
        concentracionId: 2, // 200mg
        presentacionId: 1 // Tableta
      },
      {
        nombre: 'Amoxicilina',
        codigo: 'AMOX001',
        descripcion: 'Antibiótico de amplio espectro',
        concentracionId: 3, // 500mg
        presentacionId: 1 // Tableta
      },
      {
        nombre: 'Metformina',
        codigo: 'METF001',
        descripcion: 'Antidiabético oral',
        concentracionId: 4, // 1g
        presentacionId: 1 // Tableta
      },
      {
        nombre: 'Loratadina',
        codigo: 'LORA001',
        descripcion: 'Antihistamínico para alergias',
        concentracionId: 5, // 10mg/ml
        presentacionId: 2 // Jarabe
      },
      {
        nombre: 'Omeprazol',
        codigo: 'OMEP001',
        descripcion: 'Inhibidor de la bomba de protones',
        concentracionId: 6, // 20mg/ml
        presentacionId: 3 // Inyección
      },
      {
        nombre: 'Ciprofloxacino',
        codigo: 'CIPR001',
        descripcion: 'Antibiótico fluoroquinolona',
        concentracionId: 7, // 50mg/ml
        presentacionId: 4 // Crema
      },
      {
        nombre: 'Clorfenamina',
        codigo: 'CLOR001',
        descripcion: 'Antihistamínico para resfriados y alergias',
        concentracionId: 8, // 100mg/ml
        presentacionId: 5 // Gotas
      }
    ];

    for (const medicamento of medicamentos) {
      await medicamentosService.create({
        nombre: medicamento.nombre,
        codigo: medicamento.codigo,
        descripcion: medicamento.descripcion,
        id_concentracion: medicamento.concentracionId,
        id_presentacion: medicamento.presentacionId
      });
    }

    console.log(`${medicamentos.length} medicamentos creados`);

    console.log('Creando lotes...');

    // Obtener todos los medicamentos creados
    const medicamentosCreados = await medicamentosService.findAll();

    for (const [idx, medicamento] of medicamentosCreados.entries()) {
      await lotesService.create({
        id_medicamento: medicamento.id_medicamento,
        numero_lote: `L${(idx + 1).toString().padStart(4, '0')}`,
        fecha_fabricacion: new Date(2024, 0, 1),
        fecha_caducidad: new Date(2026, 0, 1),
        cantidad_inicial: 100 + idx * 10,
        cantidad_actual: 100 + idx * 10,
      });
    }

    console.log(`${medicamentosCreados.length} lotes creados`);

    console.log('Creando inventarios...');

    const distritos = await distritosService.findAll();
    const medicamentosInventario = await medicamentosService.findAll();

    for (const distrito of distritos) {
      for (const medicamento of medicamentosInventario) {
        await inventariosService.create({
          id_distrito: distrito.id_distrito,
          id_medicamento: medicamento.id_medicamento,
          cantidad_disponible: 100,
          estado_inventario: 'DISPONIBLE',
          id_lote: 1,
          punto_reorden: 20,
        });
      }
    }

    console.log('Inventarios creados');


    // PEDIDOS
    console.log('Creando pedidos...');
    // Obtener usuarios y medicamentos
    const usuarios = await usuariosService.findAll();
    const medicamentosAll = await medicamentosService.findAll();

    // Crear un pedido
    console.log('Creando pedido...');
    const pedido = await pedidosService.create({
      id_usuario_solicitante: usuarios[0].user_id,
      id_usuario_autorizador: usuarios[0].user_id,
      observaciones: 'Pedido de prueba desde seed',
      detalles: [
        {
          id_medicamento: medicamentosAll[0].id_medicamento,
          cantidad_solicitada: 10
        },
        {
          id_medicamento: medicamentosAll[1].id_medicamento,
          cantidad_solicitada: 5
        }
      ]
    });
    console.log('Pedido creado:', pedido);

    // Crear detalles de pedido adicionales (si necesitas agregarlos manualmente)
    console.log('Creando detalles de pedido...');
    const detalle = await detallePedidosService.create({
      id_pedido: pedido.id_pedido,
      id_medicamento: medicamentosAll[3].id_medicamento,
      cantidad_solicitada: 10,
      cantidad_disponible: 8,      // Puedes calcularlo según inventario
      cantidad_aprobada: 8         // Puedes dejarlo igual a disponible o según lógica de negocio
    });
    console.log('Detalle de pedido creado:', detalle);

    // MOVIMIENTOS
    console.log('Creando movimiento...');
    const inventariosAll = await inventariosService.findAll();
    const lotesAll = await lotesService.findAll();

    const movimiento = await movimientosService.create({
      id_inventario: inventariosAll[0].id_inventario,
      id_lote: lotesAll[0].id_lote,
      tipo: 'SALIDA', // o 'ENTRADA'
      cantidad: 10,
      fecha_movimiento: new Date(),
      motivo: 'Pedido de prueba desde seed',
      user_id: usuarios[0].user_id,
    });
    console.log('Movimiento creado:', movimiento);

    // ASIGNACION_USUARIO: asignar usuario admin al distrito de Jutiapa
    console.log('Asignando usuario admin al distrito de Jutiapa...');
    const distritosAll = await distritosService.findAll();
    const distritoJutiapa = distritosAll.find(d => d.nombre.includes('Jutiapa'));
    if (distritoJutiapa) {
      const asignacionAdmin = await asignacionUsuarioService.create({
        user_id: usuarios[0].user_id, // usuario admin
        id_distrito: distritoJutiapa.id_distrito
      });
      console.log('Asignación de usuario admin al distrito de Jutiapa creada:', asignacionAdmin);
    } else {
      console.warn('No se encontró el distrito de Jutiapa para asignar el usuario admin.');
    }

    // SEGUIMIENTOS
    console.log('Creando seguimiento...');
    const seguimiento = await seguimientosService.create({
      id_usuario_admin: usuarios[0].user_id,
      id_distrito: distritos[0].id_distrito,
      fecha_visita: new Date(),
      fortalezas: 'Entrega rápida',
      debilidades: 'Ninguna',
      sugerencias: 'Mejorar embalaje',
      conclusiones: 'Todo correcto'
    });
    console.log('Seguimiento creado:', seguimiento);

    console.log('Proceso de semilla completado exitosamente!');

  } catch (error) {
    console.error('Error durante el proceso de semilla:', error);
  } finally {
    await app.close();
  }
}

bootstrap();