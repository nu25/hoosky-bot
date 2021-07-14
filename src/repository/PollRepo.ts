import { Cursor, Collection as MongoCollection } from 'mongodb';
import { Collection, Database } from '../database';

export type Poll = {
  _id: string;
  userId: string;
  channelId: string;
  question: string;
  reactions: string[];
};

class PollRepo {
  private readonly _db: Database;

  constructor(db: Database) {
    this._db = db;
  }

  create = async (guildId: string, poll: Poll): Promise<void> => {
    await this.collection(guildId).insertOne(poll);
  };

  getById = async (
    guildId: string,
    pollId: string,
    userId?: string,
  ): Promise<Poll | null> => {
    return this.collection(guildId).findOne({
      _id: pollId,
      userId: userId,
    });
  };

  getAllByUserId = async (
    guildId: string,
    userId: string,
  ): Promise<Cursor<Poll>> => {
    return this.collection(guildId).find({
      userId: userId,
    });
  };

  deleteById = async (guildId: string, pollId: string): Promise<void> => {
    this.collection(guildId).deleteMany({ _id: pollId }, function (err) {
      if (err) {
        console.log('Failed deleting the polls.');
        throw err;
      }
    });
  };

  /**
   * Returns the `poll` collection for the specified guild.
   *
   * @param guildId The ID of the guild.
   */
  collection = (guildId: string): MongoCollection<Poll> => {
    return this._db.getDb(guildId).collection(Collection.POLL);
  };
}

export default PollRepo;
