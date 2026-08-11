import type { UserDataMongooseType } from "@/models/User";

export type UserDataType = UserDataMongooseType;

export type UserDataResponse = Omit<UserDataMongooseType, "_id"> & {
  id: string;
};
