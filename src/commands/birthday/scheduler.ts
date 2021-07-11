import dayjs from 'dayjs';
import dayOfYear from 'dayjs/plugin/dayOfYear';
import cron, { CronJob } from 'cron';
import * as Discord from '../../Discord';
import { CreateMessage } from '../../Discord/message';
import ExecutionContext from '../../ExecutionContext';
import TriggerContext from '../../TriggerContext';
import { Config } from '../../database';
import { BirthdaysConfig } from '../../repository';

dayjs.extend(dayOfYear);

let job: CronJob;

export const configureScheduler = async (
  ctx: ExecutionContext | TriggerContext<Discord.Guild>,
  guildId: string,
): Promise<void> => {
  const birthdaysCfg = await ctx
    .config()
    .get<BirthdaysConfig>(guildId, Config.BIRTHDAYS);

  if (!birthdaysCfg) {
    throw new Error('No birthdays configuration found');
  }

  const schedule = await birthdaysCfg.schedule;
  const channel = await birthdaysCfg.channel;
  const messages = await birthdaysCfg.messages;

  if (!schedule || schedule.split(' ').length !== 6) {
    throw new Error('No birthdays schedule configured');
  }

  if (!messages || messages.length === 0) {
    throw new Error('No birthday messages configured');
  }

  job = new cron.CronJob(
    schedule,
    async () => {
      const dayOfYear = dayjs().dayOfYear();
      const birthdays = await ctx.birthdays().getByDay(guildId, dayOfYear);

      if (channel && birthdays && birthdays.users.length > 0) {
        let greeting = '';

        birthdays.users.map((user: string, i: number) => {
          greeting += `<@${user}>`;
          if (i !== birthdays.users.length - 1) {
            greeting += ' • ';
          }
        });

        let randomMessage =
          messages[Math.floor(Math.random() * messages.length)].message; // Pick a random message.
        randomMessage = randomMessage.replace('%', greeting); // Replace template with user mention(s)
        const messageData: CreateMessage = {
          content: randomMessage,
          tts: false,
        };

        await ctx.api.createMessage(channel, messageData);
      }
    },
    undefined,
    undefined,
    'America/New_York',
  );
};

export const startScheduler = (): void => {
  if (job) {
    job.start();
  }
};

export const stopScheduler = (): void => {
  if (job) {
    job.stop();
  }
};

export const restartScheduler = (): void => {
  stopScheduler();
  startScheduler();
};
