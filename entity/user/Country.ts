import { Column } from 'typeorm';

export class Country {
  @Column({ nullable: true })
  code: string;

  @Column({ nullable: true })
  label: string;
}

export default Country;
