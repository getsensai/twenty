import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddNotificationPreferencesToUserWorkspace1773330000000
  implements MigrationInterface
{
  name = 'AddNotificationPreferencesToUserWorkspace1773330000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" ADD "notificationPreferences" jsonb`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" DROP COLUMN "notificationPreferences"`,
    );
  }
}
