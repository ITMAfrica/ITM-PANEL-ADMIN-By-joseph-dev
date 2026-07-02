-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_channelId_fkey";
ALTER TABLE "Message" DROP CONSTRAINT "Message_userId_fkey";
ALTER TABLE "ChannelMember" DROP CONSTRAINT "ChannelMember_channelId_fkey";
ALTER TABLE "ChannelMember" DROP CONSTRAINT "ChannelMember_userId_fkey";
ALTER TABLE "Channel" DROP CONSTRAINT "Channel_workspaceId_fkey";

-- DropTable
DROP TABLE "Message";
DROP TABLE "ChannelMember";
DROP TABLE "Channel";
