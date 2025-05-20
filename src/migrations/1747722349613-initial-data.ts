import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialData1747722349613 implements MigrationInterface {
    name = 'InitialData1747722349613'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "personas" ("id_persona" SERIAL NOT NULL, "nombre" character varying(100) NOT NULL, "apellido" character varying(100) NOT NULL, "fecha_nacimiento" date NOT NULL, CONSTRAINT "PK_a8294b844f4e1849ccf15ae57d1" PRIMARY KEY ("id_persona"))`);
        await queryRunner.query(`CREATE TABLE "roles" ("id_rol" SERIAL NOT NULL, "nombre_rol" character varying(50) NOT NULL, CONSTRAINT "UQ_a722dfef88f835ff0933fda8c8d" UNIQUE ("nombre_rol"), CONSTRAINT "PK_25f8d4161f00a1dd1cbe5068695" PRIMARY KEY ("id_rol"))`);
        await queryRunner.query(`CREATE TABLE "usuarios" ("user_id" SERIAL NOT NULL, "username" character varying(50) NOT NULL, "contrasena" character varying(100) NOT NULL, "fecha_registro" TIMESTAMP NOT NULL DEFAULT now(), "activo" boolean NOT NULL DEFAULT true, "id_persona" integer NOT NULL, CONSTRAINT "UQ_9f78cfde576fc28f279e2b7a9cb" UNIQUE ("username"), CONSTRAINT "PK_edafde23eca009a80a511ed3086" PRIMARY KEY ("user_id"))`);
        await queryRunner.query(`CREATE TABLE "usuario_rol" ("user_id" integer NOT NULL, "id_rol" integer NOT NULL, CONSTRAINT "PK_3f0958e56987d230719fb4495e4" PRIMARY KEY ("user_id", "id_rol"))`);
        await queryRunner.query(`CREATE INDEX "IDX_0e354e09052206526adf88735d" ON "usuario_rol" ("user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_96d2a6ecb2ad0931416610845c" ON "usuario_rol" ("id_rol") `);
        await queryRunner.query(`ALTER TABLE "usuarios" ADD CONSTRAINT "FK_5b29c4b5cc11b9c67c8b70c9cb2" FOREIGN KEY ("id_persona") REFERENCES "personas"("id_persona") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "usuario_rol" ADD CONSTRAINT "FK_0e354e09052206526adf88735d2" FOREIGN KEY ("user_id") REFERENCES "usuarios"("user_id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "usuario_rol" ADD CONSTRAINT "FK_96d2a6ecb2ad0931416610845cf" FOREIGN KEY ("id_rol") REFERENCES "roles"("id_rol") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
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
