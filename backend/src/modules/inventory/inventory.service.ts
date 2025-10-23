import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inventory } from './entities/inventory.entity';
import { AddStockDto } from './dto/add-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { VehiclesService } from '../vehicles/vehicles.service';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private inventoryRepository: Repository<Inventory>,
    private vehiclesService: VehiclesService,
  ) {}

  async addStock(addStockDto: AddStockDto): Promise<Inventory> {
    await this.vehiclesService.findOne(addStockDto.vehicle_id);

    const existingInventory = await this.inventoryRepository.findOne({
      where: {
        vehicle_id: addStockDto.vehicle_id,
        fish_type: addStockDto.fish_type,
      }
    });

    if (existingInventory) {
      // Update existing inventory
      existingInventory.quantity += addStockDto.quantity;
      existingInventory.unit_price = addStockDto.unit_price;
      return await this.inventoryRepository.save(existingInventory);
    } else {
      // Create new inventory record
      const inventory = this.inventoryRepository.create(addStockDto);
      return await this.inventoryRepository.save(inventory);
    }
  }

  async updateStock(id: string, updateStockDto: UpdateStockDto): Promise<Inventory> {
    const inventory = await this.findOne(id);
    Object.assign(inventory, updateStockDto);
    return await this.inventoryRepository.save(inventory);
  }

  async findAll(): Promise<Inventory[]> {
    return await this.inventoryRepository.find({
      relations: ['vehicle'],
      order: { updated_at: 'DESC' }
    });
  }

  async findOne(id: string): Promise<Inventory> {
    const inventory = await this.inventoryRepository.findOne({
      where: { id },
      relations: ['vehicle']
    });
    if (!inventory) {
      throw new NotFoundException('Inventory not found');
    }
    return inventory;
  }

  async findByVehicle(vehicleId: string): Promise<Inventory[]> {
    await this.vehiclesService.findOne(vehicleId);
    return await this.inventoryRepository.find({
      where: { vehicle_id: vehicleId },
      order: { fish_type: 'ASC' }
    });
  }

  async getLowStock(threshold: number = 10): Promise<Inventory[]> {
    return await this.inventoryRepository
      .createQueryBuilder('inventory')
      .where('inventory.quantity <= :threshold', { threshold })
      .andWhere('inventory.quantity > 0')
      .leftJoinAndSelect('inventory.vehicle', 'vehicle')
      .orderBy('inventory.quantity', 'ASC')
      .getMany();
  }

  async getAvailableFishTypes(): Promise<string[]> {
    const result = await this.inventoryRepository
      .createQueryBuilder('inventory')
      .select('DISTINCT inventory.fish_type', 'fish_type')
      .where('inventory.quantity > 0')
      .getRawMany();

    return result.map(item => item.fish_type);
  }

  async deductStock(vehicleId: string, fishType: string, quantity: number): Promise<Inventory> {
    const inventory = await this.inventoryRepository.findOne({
      where: {
        vehicle_id: vehicleId,
        fish_type: fishType,
      }
    });

    if (!inventory) {
      throw new NotFoundException(`Inventory not found for ${fishType}`);
    }

    if (inventory.quantity < quantity) {
      throw new BadRequestException(`Insufficient stock for ${fishType}. Available: ${inventory.quantity}, Requested: ${quantity}`);
    }

    inventory.quantity -= quantity;
    return await this.inventoryRepository.save(inventory);
  }

  async remove(id: string): Promise<void> {
    const inventory = await this.findOne(id);
    await this.inventoryRepository.remove(inventory);
  }
}