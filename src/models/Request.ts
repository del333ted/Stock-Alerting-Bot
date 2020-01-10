// Dependencies
import { prop, getModelForClass } from '@typegoose/typegoose'

export class Request {
  @prop({ required: true, index: true, unique: true })
  id: number

  @prop({ required: true, index: true })
  telegramId: number
}

// Get Chat model
export const RequestModel = getModelForClass(Request, {
  schemaOptions: { timestamps: true },
})

// Get or create request
export async function findRequest(id: number, telegramId: number) {
  let request = await RequestModel.findOne({ id })
  if (!request) {
    try {
      request = await new RequestModel({ id, telegramId }).save()
    } catch (err) {
      request = await RequestModel.findOne({ id })
    }
  }
  return request
}
