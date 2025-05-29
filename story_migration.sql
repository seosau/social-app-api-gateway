
-- CreateTable
CREATE TABLE "story" (
    "id" TEXT NOT NULL,
    "image" VARCHAR NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,
    "userId" UUID NOT NULL,

    CONSTRAINT "story_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "story" ADD CONSTRAINT "story_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

