// Dependencies
import { prop, getModelForClass } from '@typegoose/typegoose'

export class Chat {
  @prop({ required: true, index: true, unique: true })
  id: number
}

// Get Chat model
export const ChatModel = getModelForClass(Chat, {
  schemaOptions: { timestamps: true },
})

// Get or create chat
export async function findChat(id: number) {
  let chat = await ChatModel.findOne({ id })
  if (!chat) {
    try {
        chat = await new ChatModel({ id }).save()
    } catch (err) {
        chat = await ChatModel.findOne({ id })
    }
  }
  return chat
}