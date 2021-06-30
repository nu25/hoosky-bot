import cronstrue from 'cronstrue';
import * as Discord from '../../../Discord';
import SubCommand from '../../../SubCommand';
import { Config, BirthdaysConfig } from '../../../database';

export const scheduleGet = new SubCommand({
  name: 'schedule-get',
  displayName: 'Get Schedule',
  description: 'Get schedule for sending birthday messages',
  requiredPermissions: [Discord.Permission.MANAGE_ROLES],
  handler: async ctx => {
    const guildId = ctx.mustGetGuildId();

    // Fetch the role configuration from the database.
    const birthdaysCfg = await ctx.db.getConfigValue<BirthdaysConfig>(
      guildId,
      Config.BIRTHDAYS,
    );

    if (birthdaysCfg && birthdaysCfg.schedule) {
      return ctx.respondWithMessage(
        `Birthday messages send ${cronstrue
          .toString(birthdaysCfg.schedule, { verbose: true })
          .toLowerCase()}`,
      );
    }

    return ctx.respondWithError(`Unable to get the birthdays schedule`);
  },
});

export default scheduleGet;
