/**
 * MessagesController unit tests.
 */
import { MessagesController } from "../messages.controller";
import { MessagesService } from "../messages.service";

const makeService = () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findThread: jest.fn(),
  findOne: jest.fn(),
  markAsRead: jest.fn(),
});

describe("MessagesController", () => {
  let controller: MessagesController;
  let service: ReturnType<typeof makeService>;

  beforeEach(() => {
    service = makeService();
    controller = new MessagesController(service as unknown as MessagesService);
  });

  it("should create message", async () => {
    const req = { user: { sub: "user-1" } } as any;
    const dto = { recipientId: "user-2", body: "Hello" } as any;
    service.create.mockResolvedValue({ id: "msg-1" });

    await controller.create(req, dto);

    expect(service.create).toHaveBeenCalledWith("user-1", dto);
  });

  it("should return all messages", async () => {
    const req = { user: { sub: "user-1" } } as any;
    const query = { isRead: false } as any;
    service.findAll.mockResolvedValue({ messages: [], total: 0 });

    await controller.findAll(req, query);

    expect(service.findAll).toHaveBeenCalledWith("user-1", query);
  });

  it("should return thread", async () => {
    const req = { user: { sub: "user-1" } } as any;
    service.findThread.mockResolvedValue([]);

    await controller.findThread(req, "thread-1");

    expect(service.findThread).toHaveBeenCalledWith("thread-1", "user-1");
  });

  it("should return one message", async () => {
    const req = { user: { sub: "user-1" } } as any;
    service.findOne.mockResolvedValue({ id: "msg-1" });

    await controller.findOne(req, "msg-1");

    expect(service.findOne).toHaveBeenCalledWith("msg-1", "user-1");
  });

  it("should mark as read and return message", async () => {
    const req = { user: { sub: "user-1" } } as any;
    service.markAsRead.mockResolvedValue(undefined);

    const result = await controller.markAsRead(req, "msg-1");

    expect(service.markAsRead).toHaveBeenCalledWith("msg-1", "user-1");
    expect(result).toEqual({ message: "Message marked as read" });
  });
});
