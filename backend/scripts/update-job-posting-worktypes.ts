import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { JobPosting, WorkType } from '../src/job-postings/entities/job-posting.entity';

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  username: process.env.DB_USER || 'hruser',
  password: process.env.DB_PASSWORD || 'hrpassword',
  database: process.env.DB_NAME || 'hrdb',
  entities: [JobPosting],
});

const WORK_TYPES = [WorkType.ONSITE, WorkType.HYBRID, WorkType.REMOTE];

function pickRandomWorkType() {
  return WORK_TYPES[Math.floor(Math.random() * WORK_TYPES.length)];
}

async function main() {
  await dataSource.initialize();

  const postingRepo = dataSource.getRepository(JobPosting);
  const postings = await postingRepo.find();

  const toUpdate = postings.filter((posting) => posting.workType === null || posting.workType === undefined);

  if (toUpdate.length === 0) {
    console.log('No old job postings found that need work type assignment.');
    await dataSource.destroy();
    return;
  }

  for (const posting of toUpdate) {
    posting.workType = pickRandomWorkType();
  }

  await postingRepo.save(toUpdate);
  console.log(`Updated ${toUpdate.length} job posting(s) with random workType values.`);
  console.table(toUpdate.map((posting) => ({ id: posting.id, title: posting.title, workType: posting.workType })));

  await dataSource.destroy();
}

main().catch((error) => {
  console.error('Failed to update job posting work locations:', error);
  process.exit(1);
});
