import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialData1747722349613 implements MigrationInterface {
    name = 'InitialData1747722349613'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "personas" ("id_persona" SERIAL NOT NULL, "nombre" character varying(100) NOT NULL, "apellido" character varying(100) NOT NULL, "fecha_nacimiento" date NOT NULL, CONSTRAINT "PK_a8294b844f4e1849ccf15ae57d1" PRIMARY KEY ("id_persona"))`);
        await queryRunner.query(`CREATE TABLE "roles" ("id_rol" SERIAL NOT NULL, "nombre_rol" character varying(50) NOT NULL, CONSTRAINT "UQ_a722dfef88f835ff0933fda8c8d" UNIQUE ("nombre_rol"), CONSTRAINT "PK_25f8d4161f00a1dd1cbe5068695" PRIMARY KEY ("id_rol"))`);
        await queryRunner.query(`CREATE TABLE "usuarios" ("user_id" SERIAL NOT NULL, "username" character varying(50) NOT NULL, "correo" character varying(100) NOT NULL, "contrasena" character varying(100) NOT NULL, "fecha_registro" TIMESTAMP NOT NULL DEFAULT now(), "activo" boolean NOT NULL DEFAULT true, "id_persona" integer NOT NULL, CONSTRAINT "UQ_9f78cfde576fc28f279e2b7a9cb" UNIQUE ("username"), CONSTRAINT "UQ_8e1f623798118e629b46a9e629b" UNIQUE ("correo"), CONSTRAINT "PK_edafde23eca009a80a511ed3086" PRIMARY KEY ("user_id"))`);
        await queryRunner.query(`CREATE TABLE "usuario_rol" ("user_id" integer NOT NULL, "id_rol" integer NOT NULL, CONSTRAINT "PK_3f0958e56987d230719fb4495e4" PRIMARY KEY ("user_id", "id_rol"))`);
        await queryRunner.query(`CREATE INDEX "IDX_0e354e09052206526adf88735d" ON "usuario_rol" ("user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_96d2a6ecb2ad0931416610845c" ON "usuario_rol" ("id_rol") `);
        await queryRunner.query(`ALTER TABLE "usuarios" ADD CONSTRAINT "FK_5b29c4b5cc11b9c67c8b70c9cb2" FOREIGN KEY ("id_persona") REFERENCES "personas"("id_persona") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "usuario_rol" ADD CONSTRAINT "FK_0e354e09052206526adf88735d2" FOREIGN KEY ("user_id") REFERENCES "usuarios"("user_id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "usuario_rol" ADD CONSTRAINT "FK_96d2a6ecb2ad0931416610845cf" FOREIGN KEY ("id_rol") REFERENCES "roles"("id_rol") ON DELETE NO ACTION ON UPDATE NO ACTION`);

        await queryRunner.query(`
            CREATE TABLE "departamentos" (
                "id_departamento" SERIAL NOT NULL,
                "nombre" character varying(100) NOT NULL,
                CONSTRAINT "PK_departamentos_id" PRIMARY KEY ("id_departamento")
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "municipios" (
                "id_municipio" SERIAL NOT NULL,
                "nombre" character varying(100) NOT NULL,
                "id_departamento" integer NOT NULL,
                CONSTRAINT "PK_municipios_id" PRIMARY KEY ("id_municipio"),
                CONSTRAINT "FK_municipios_departamento" FOREIGN KEY ("id_departamento") REFERENCES "departamentos"("id_departamento") ON DELETE CASCADE ON UPDATE CASCADE
            )
        `);
        
        await queryRunner.query(`
            CREATE TABLE "distritos" (
                "id_distrito" SERIAL NOT NULL,
                "nombre" character varying(100) NOT NULL,
                "id_municipio" integer NOT NULL,
                CONSTRAINT "PK_distritos_id" PRIMARY KEY ("id_distrito"),
                CONSTRAINT "FK_distritos_municipio" FOREIGN KEY ("id_municipio") REFERENCES "municipios"("id_municipio") ON DELETE CASCADE ON UPDATE CASCADE
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "concentraciones" (
                "id_concentracion" SERIAL NOT NULL,
                "valor" integer NOT NULL,
                "unidad_medida" character varying(20) NOT NULL,
                CONSTRAINT "PK_concentraciones_id" PRIMARY KEY ("id_concentracion")
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "presentaciones" (
                "id_presentacion" SERIAL NOT NULL,
                "nombre" character varying(100) NOT NULL,
                "descripcion" text,
                CONSTRAINT "PK_presentaciones_id" PRIMARY KEY ("id_presentacion")
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "medicamentos" (
                "id_medicamento" SERIAL NOT NULL,
                "nombre" character varying(200) NOT NULL,
                "codigo" character varying(100) NOT NULL UNIQUE,
                "descripcion" text,
                "id_presentacion" integer NOT NULL,
                "id_concentracion" integer NOT NULL,
                CONSTRAINT "PK_medicamentos_id" PRIMARY KEY ("id_medicamento"),
                CONSTRAINT "FK_medicamentos_presentacion" FOREIGN KEY ("id_presentacion") REFERENCES "presentaciones"("id_presentacion") ON DELETE NO ACTION ON UPDATE NO ACTION,
                CONSTRAINT "FK_medicamentos_concentracion" FOREIGN KEY ("id_concentracion") REFERENCES "concentraciones"("id_concentracion") ON DELETE NO ACTION ON UPDATE NO ACTION
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "lotes" (
                "id_lote" SERIAL NOT NULL,
                "id_medicamento" integer NOT NULL,
                "numero_lote" character varying(100) NOT NULL,
                "fecha_fabricacion" date NOT NULL,
                "fecha_caducidad" date NOT NULL,
                "cantidad_inicial" integer NOT NULL DEFAULT 0,
                "cantidad_actual" integer NOT NULL DEFAULT 0,
                CONSTRAINT "PK_lotes_id" PRIMARY KEY ("id_lote"),
                CONSTRAINT "FK_lotes_medicamento" FOREIGN KEY ("id_medicamento") REFERENCES "medicamentos"("id_medicamento") ON DELETE NO ACTION ON UPDATE NO ACTION
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "inventarios" (
                "id_inventario" SERIAL NOT NULL,
                "id_medicamento" integer NOT NULL,
                "id_lote" integer NOT NULL,
                "id_distrito" integer NOT NULL,
                "cantidad_disponible" integer NOT NULL DEFAULT 0,
                "estado_inventario" character varying(20) NOT NULL DEFAULT 'DISPONIBLE',
                "punto_reorden" integer NOT NULL DEFAULT 10,
                "fecha_creacion" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_inventarios_id" PRIMARY KEY ("id_inventario"),
                CONSTRAINT "FK_inventarios_medicamento" FOREIGN KEY ("id_medicamento") REFERENCES "medicamentos"("id_medicamento") ON DELETE NO ACTION ON UPDATE NO ACTION,
                CONSTRAINT "FK_inventarios_lote" FOREIGN KEY ("id_lote") REFERENCES "lotes"("id_lote") ON DELETE NO ACTION ON UPDATE NO ACTION,
                CONSTRAINT "FK_inventarios_distrito" FOREIGN KEY ("id_distrito") REFERENCES "distritos"("id_distrito") ON DELETE NO ACTION ON UPDATE NO ACTION
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "pedidos" (
                "id_pedido" SERIAL NOT NULL,
                "id_usuario_solicitante" integer NOT NULL,
                "id_usuario_autorizador" integer NOT NULL,
                "fecha_solicitud" date NOT NULL,
                "fecha_autorizacion" date,
                "fecha_despachada" date,
                "fecha_llegada_distrito" date,
                "estado" character varying(20) NOT NULL DEFAULT 'PENDIENTE',
                "observaciones" text,
                CONSTRAINT "PK_pedidos_id" PRIMARY KEY ("id_pedido"),
                CONSTRAINT "FK_pedidos_usuario_solicitante" FOREIGN KEY ("id_usuario_solicitante") REFERENCES "usuarios"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION,
                CONSTRAINT "FK_pedidos_usuario_autorizador" FOREIGN KEY ("id_usuario_autorizador") REFERENCES "usuarios"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "detalle_pedidos" (
                "id_detalle" SERIAL NOT NULL,
                "id_pedido" integer NOT NULL,
                "id_medicamento" integer NOT NULL,
                "cantidad_solicitada" integer NOT NULL,
                "cantidad_disponible" integer,
                "cantidad_aprobada" integer,
                CONSTRAINT "PK_detalle_pedidos_id" PRIMARY KEY ("id_detalle"),
                CONSTRAINT "FK_detalle_pedidos_pedido" FOREIGN KEY ("id_pedido") REFERENCES "pedidos"("id_pedido") ON DELETE CASCADE ON UPDATE CASCADE,
                CONSTRAINT "FK_detalle_pedidos_medicamento" FOREIGN KEY ("id_medicamento") REFERENCES "medicamentos"("id_medicamento") ON DELETE NO ACTION ON UPDATE NO ACTION
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "movimientos" (
                "id_movimiento" SERIAL NOT NULL,
                "id_inventario" integer NOT NULL,
                "id_lote" integer NOT NULL,
                "tipo" character varying(20) NOT NULL,
                "cantidad" integer NOT NULL,
                "fecha_movimiento" TIMESTAMP NOT NULL,
                "motivo" character varying(200) NOT NULL,
                "user_id" integer NOT NULL,
                CONSTRAINT "PK_movimientos_id" PRIMARY KEY ("id_movimiento"),
                CONSTRAINT "FK_movimientos_inventario" FOREIGN KEY ("id_inventario") REFERENCES "inventarios"("id_inventario") ON DELETE NO ACTION ON UPDATE NO ACTION,
                CONSTRAINT "FK_movimientos_lote" FOREIGN KEY ("id_lote") REFERENCES "lotes"("id_lote") ON DELETE NO ACTION ON UPDATE NO ACTION,
                CONSTRAINT "FK_movimientos_usuario" FOREIGN KEY ("user_id") REFERENCES "usuarios"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "seguimientos" (
                "id_seguimiento" SERIAL NOT NULL,
                "id_usuario_admin" integer NOT NULL,
                "id_distrito" integer NOT NULL,
                "fecha_visita" date NOT NULL,
                "fortalezas" text,
                "debilidades" text,
                "sugerencias" text,
                "conclusiones" text,
                CONSTRAINT "PK_seguimientos_id" PRIMARY KEY ("id_seguimiento"),
                CONSTRAINT "FK_seguimientos_usuario_admin" FOREIGN KEY ("id_usuario_admin") REFERENCES "usuarios"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION,
                CONSTRAINT "FK_seguimientos_distrito" FOREIGN KEY ("id_distrito") REFERENCES "distritos"("id_distrito") ON DELETE NO ACTION ON UPDATE NO ACTION
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "asignacion_usuario" (
                "id_asignacion" SERIAL NOT NULL,
                "user_id" integer NOT NULL,
                "id_departamento" integer,
                "id_distrito" integer,
                CONSTRAINT "PK_asignacion_usuario_id" PRIMARY KEY ("id_asignacion"),
                CONSTRAINT "FK_asignacion_usuario_user" FOREIGN KEY ("user_id") REFERENCES "usuarios"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION,
                CONSTRAINT "FK_asignacion_usuario_departamento" FOREIGN KEY ("id_departamento") REFERENCES "departamentos"("id_departamento") ON DELETE NO ACTION ON UPDATE NO ACTION,
                CONSTRAINT "FK_asignacion_usuario_distrito" FOREIGN KEY ("id_distrito") REFERENCES "distritos"("id_distrito") ON DELETE NO ACTION ON UPDATE NO ACTION
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "asignacion_usuario"`);
        await queryRunner.query(`DROP TABLE "seguimientos"`);
        await queryRunner.query(`DROP TABLE "movimientos"`);
        await queryRunner.query(`DROP TABLE "detalle_pedidos"`);
        await queryRunner.query(`DROP TABLE "pedidos"`);
        await queryRunner.query(`DROP TABLE "inventarios"`);
        await queryRunner.query(`DROP TABLE "lotes"`);
        await queryRunner.query(`DROP TABLE "medicamentos"`);
        await queryRunner.query(`DROP TABLE "presentaciones"`);
        await queryRunner.query(`DROP TABLE "concentraciones"`);
        await queryRunner.query(`DROP TABLE "distritos"`);
        await queryRunner.query(`DROP TABLE "municipios"`);
        await queryRunner.query(`DROP TABLE "departamentos"`);

        await queryRunner.query(`ALTER TABLE "usuario_rol" DROP CONSTRAINT "FK_96d2a6ecb2ad0931416610845cf"`);
        await queryRunner.query(`ALTER TABLE "usuario_rol" DROP CONSTRAINT "FK_0e354e09052206526adf88735d2"`);
        await queryRunner.query(`ALTER TABLE "usuarios" DROP CONSTRAINT "FK_5b29c4b5cc11b9c67c8b70c9cb2"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_96d2a6ecb2ad0931416610845c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0e354e09052206526adf88735d"`);
        await queryRunner.query(`DROP TABLE "usuario_rol"`);
        await queryRunner.query(`DROP TABLE "usuarios"`);
        await queryRunner.query(`DROP TABLE "roles"`);
        await queryRunner.query(`DROP TABLE "personas"`);
    }

}
