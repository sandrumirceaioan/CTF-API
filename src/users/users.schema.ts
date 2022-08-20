import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from "@nestjs/swagger";

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop()
  _id?: string;

  @ApiProperty({ example: 'user@email.com' })
  @Prop({ required: true, unique: true })
  email: string;

  @ApiProperty({ example: '12345' })
  @Prop({ required: true })
  password: string;

  @ApiProperty({ example: 'John' })
  @Prop({ required: true })
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @Prop({ required: true })
  lastName: string;

  @ApiProperty({ example: '1987-06-24' })
  @Prop({ required: true })
  birthDate: Date;

  @ApiProperty({ example: 'male' })
  @Prop({ required: true })
  gender: 'male' | 'female';

  @ApiProperty({ example: 'user' })
  @Prop()
  role: 'admin' | 'user';

  @Prop()
  status: boolean;

  @Prop()
  photo: string;

  @Prop()
  loggedAt: Date;

  @Prop({ default: new Date() })
  createdAt: Date
}

export const UserSchema = SchemaFactory.createForClass(User);