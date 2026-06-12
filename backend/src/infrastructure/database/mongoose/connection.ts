import mongoose from 'mongoose';

export async function connectMongo(uri?: string): Promise<void> {
  const mongoUri = uri ?? process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error('MONGODB_URI is not defined');
  }

  await mongoose.connect(mongoUri);
}

export async function disconnectMongo(): Promise<void> {
  await mongoose.disconnect();
}

export function getMongoConnectionState(): number {
  return mongoose.connection.readyState;
}
