import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/see-data';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class SeedService {
  constructor(
    private readonly productService: ProductsService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async executeSeed() {
    await this.deleteTables();
    const adminUser = await this.insertNewUsers();
    await this.insertNewProducts(adminUser);
    return 'Seed executed';
  }

  private async deleteTables() {
    await this.productService.deleteAllProducts();
    const userQueryBuilder = this.userRepository.createQueryBuilder();
    await userQueryBuilder.delete().where({}).execute();
  }

  private async insertNewUsers() {
    const seedUsers = initialData.users;
    //const users: User[] = [];

    // seedUsers.forEach(async (user) => {
    //   const pwd = await bcrypt.hash(user.password, 10);
    //   console.log('pwd ::', pwd);
    //   users.push(this.userRepository.create({ ...user, password: pwd }));
    // });

    // console.log('usuarios ::', users);
    // const dbUsers = await this.userRepository.save(users);

    // console.log('usuarios insertados ::', dbUsers);

    // return dbUsers[0];

    const user = this.userRepository.create({
      ...seedUsers[0],
      password: await bcrypt.hash(seedUsers[0].password, 10),
    });

    const dbUser = await this.userRepository.save(user);

    return dbUser;
  }

  private async insertNewProducts(user: User) {
    await this.productService.deleteAllProducts();

    const products = initialData.products;
    const insertPromises = [];

    products.forEach((product) => {
      insertPromises.push(this.productService.create(product, user));
    });

    await Promise.all(insertPromises);

    return true;
  }
}
