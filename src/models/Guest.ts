import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export type DocumentType = "dni" | "passport" | "other";
export type GuestStatus = "active" | "suspended" | "deleted";

export interface IDocument {
  type: DocumentType;
  number: string;
}

export interface IGuest extends Document {
  guestId: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  document: IDocument;
  nationality: string;
  avatar?: string;
  notes?: string;
  customProperties?: Record<string, unknown>;
  status: GuestStatus;
  emailVerified: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const documentSchema = new Schema<IDocument>(
  {
    type: {
      type: String,
      enum: ["dni", "passport", "other"],
      required: true,
    },
    number: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const guestSchema = new Schema<IGuest>(
  {
    guestId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    phone: {
      type: String,
      required: true,
    },
    document: {
      type: documentSchema,
      required: true,
    },
    nationality: {
      type: String,
      required: true,
      uppercase: true,
    },
    avatar: {
      type: String,
      default: undefined,
    },
    notes: {
      type: String,
      maxlength: 1000,
      default: undefined,
    },
    customProperties: {
      type: Schema.Types.Mixed,
      default: {},
    },
    status: {
      type: String,
      enum: ["active", "suspended", "deleted"],
      default: "active",
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    lastLoginAt: {
      type: Date,
      default: undefined,
    },
  },
  {
    timestamps: true,
  }
);

guestSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

guestSchema.methods.comparePassword = async function (
  candidate: string
): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

guestSchema.index({ "document.number": 1 });

export const Guest: Model<IGuest> = mongoose.model<IGuest>("Guest", guestSchema);
