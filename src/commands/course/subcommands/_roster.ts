import SubCommand from '../../../SubCommand';
import CommandOption from '../../../CommandOption';
import { CommandOptionType } from '../../../Discord';
import { getCourse, getCourseMembers } from '../_common';

export const roster = new SubCommand({
  name: 'roster',
  displayName: 'Returns a roster of members in a course',
  description: 'Returns a roster of members in a course',
  requiredPermissions: [],
  options: [
    new CommandOption({
      name: 'role',
      description: 'The course role',
      required: true,
      type: CommandOptionType.ROLE,
    }),
  ],
  handler: async ctx => {
    const guildId = ctx.mustGetGuildId();
    const roleId = ctx.getArgument<string>('role') as string;

    const course = await getCourse(ctx, guildId, roleId);
    if (!course) {
      return ctx.respondWithError(`That course does not exist`);
    }

    const members = (await getCourseMembers(ctx, guildId, roleId)) ?? [];

    let membersList = `Here is a list of all ${members.length} members in **${course.crn} - ${course.name}**: \n`;
    for (let i = 0; i < members.length; i++) {
      membersList += `<@${members[i]}> \n`;
    }

    return ctx.respondSilently(membersList);
  },
});
