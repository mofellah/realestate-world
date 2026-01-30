/**
 * ListingsController unit tests.
 */
import { ListingsController } from '../listings.controller';
import { ListingsService } from '../listings.service';

const makeService = () => ({
  create: jest.fn(),
  findByUser: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

describe('ListingsController', () => {
  let controller: ListingsController;
  let service: ReturnType<typeof makeService>;

  beforeEach(() => {
    service = makeService();
    controller = new ListingsController(service as unknown as ListingsService);
  });

  it('should create listing', async () => {
    const dto = { propertyId: 'prop-1', type: 'sale' } as any;
    const user = { sub: 'user-1' } as any;
    service.create.mockResolvedValue({ id: 'listing-1' });

    await controller.create(dto, user);

    expect(service.create).toHaveBeenCalledWith('user-1', dto);
  });

  it('should find all listings for user', async () => {
    const user = { sub: 'user-1' } as any;
    service.findByUser.mockResolvedValue([]);

    await controller.findAll(user, '5', '15');

    expect(service.findByUser).toHaveBeenCalledWith('user-1', 5, 15);
  });

  it('should use default pagination when skip/take missing', async () => {
    const user = { sub: 'user-1' } as any;
    service.findByUser.mockResolvedValue([]);

    await controller.findAll(user, undefined as any, undefined as any);

    expect(service.findByUser).toHaveBeenCalledWith('user-1', 0, 10);
  });

  it('should find one listing', async () => {
    service.findById.mockResolvedValue({ id: 'listing-1' });

    await controller.findOne('listing-1');

    expect(service.findById).toHaveBeenCalledWith('listing-1');
  });

  it('should update listing', async () => {
    const dto = { status: 'published' } as any;
    const user = { sub: 'user-1' } as any;
    service.update.mockResolvedValue({ id: 'listing-1' });

    await controller.update('listing-1', dto, user);

    expect(service.update).toHaveBeenCalledWith('listing-1', 'user-1', dto);
  });

  it('should delete listing', async () => {
    const user = { sub: 'user-1' } as any;
    service.delete.mockResolvedValue(undefined);

    await controller.delete('listing-1', user);

    expect(service.delete).toHaveBeenCalledWith('listing-1', 'user-1');
  });
});
