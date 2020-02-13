import { MongoClient } from 'mongodb';

export class DBClient {
  static mongoClient: MongoClient;

  static async init(): Promise<void> {
    const { MONGO_USER, MONGO_PASSWORD } = process.env;
    const connectionString = `mongodb+srv://${MONGO_USER}:${MONGO_PASSWORD}@music-graph-gn0ss.mongodb.net/test?retryWrites=true&w=majority`;

    this.mongoClient = await MongoClient.connect(connectionString, { useNewUrlParser: true });
    console.log('Connected to MongoDB');
  }

  static async insertRecord(dbName: string, collectionName: string, query: any, recordBody: any): Promise<any> {
    const db = this.mongoClient.db(dbName);

    const collection = db.collection(collectionName);
    return await collection.updateOne(query, recordBody, { upsert: true });
  }

  static async findRecord(dbName: string, collectionName: string, query: any): Promise<any> {
    const db = this.mongoClient.db(dbName);

    const collection = db.collection(collectionName);
    return await collection.findOne(query);
  }

  static async close(): Promise<void> {
    return await this.mongoClient.close();
  }
}
