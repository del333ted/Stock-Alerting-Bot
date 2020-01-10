// Dependencies
import { prop, getModelForClass } from '@typegoose/typegoose'

export enum TelegramLanguage {
  en = 'en',
  ru = 'ru',
}

export class UserSettings {
  @prop()
  favorites?: string[]

  @prop({ required: true, default: false })
  notify: boolean

  @prop({ required: true, default: 0 })
  timezone: number

  @prop()
  notifyPeriod?: number
}

export class Session {
  @prop({ required: true, default: 'default' })
  stage: string
}

export class User {
  @prop({ required: true, index: true, unique: true })
  telegramId: number

  @prop()
  settings: UserSettings

  @prop({ enum: TelegramLanguage })
  telegramLanguage?: TelegramLanguage

  @prop()
  session: Session
}

// Get User model
export const UserModel = getModelForClass(User, {
  schemaOptions: { timestamps: true },
})

// Get or create chat
export async function findUser(id: number) {
  let User = await UserModel.findOne({ telegramId: id })
  if (!User) {
    try {
      User = await new UserModel({
        telegramId: id,
        session: { stage: 0 },
        settings: { notify: false, timezone: 0 },
      }).save()
    } catch (err) {
      console.log(err)
      User = await UserModel.findOne({ telegramId: id })
    }
  }
  return User
}
