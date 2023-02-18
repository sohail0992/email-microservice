import mongoose, { Schema } from 'mongoose';
import { Document } from 'mongoose';

export interface IEmail extends Document {
  from: string;
  to: string;
  subject: string;
  text: string;
  firstName: string;
  lastName: string;
  error: String;
  response: Object;
}

const EmailSchema: Schema = new Schema({
  from: { 
    type: String,
    required: true 
  },
  to: { 
    type: String,
    required: true 
  },
  subject: { 
    type: String,
    required: false 
  },
  text: { 
    type: String, 
    required: true
  },
  firstName: { 
    type: String,
    required: false 
  },
  lastName: { 
    type: String, 
    required: false 
  },
  error:  { 
    type: String, 
    required: false 
  },
  response:  { 
    type: Object, 
    required: false 
  }
});

export default mongoose.model<IEmail>('Email', EmailSchema);