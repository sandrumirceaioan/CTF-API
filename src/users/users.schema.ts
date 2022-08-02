import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from "@nestjs/swagger";

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop()
  _id: string;

  @ApiProperty({ example: 'example@email.com' })
  @Prop({ required: true, unique: true })
  email: string;

  @ApiProperty({ example: 'John' })
  @Prop({ required: true })
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @Prop({ required: true })
  lastName: string;

  @ApiProperty({ example: 'TODO !!!' })
  @Prop({ required: true })
  birthDate: Date;

  @ApiProperty({ example: 'male/female' })
  @Prop({ required: true })
  gender: 'male' | 'female';

  @ApiProperty()
  @Prop({ required: true })
  role: 'admin' | 'user';

  @Prop()
  status: boolean;

  @Prop()
  photo: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  loggedAt: Date;

  @Prop({ default: new Date() })
  createdAt: Date
}

export const UserSchema = SchemaFactory.createForClass(User);