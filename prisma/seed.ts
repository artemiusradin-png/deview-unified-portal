import { PrismaClient, Role, type Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { profiles } from "../src/lib/mock-data";

const prisma = new PrismaClient();

const defaultDataSources: Array<{
  id: string;
  name: string;
  businessOwner: string | null;
  businessUnit: string | null;
  format: string;
  location: string | null;
  accessMethod: string | null;
  refreshMethod: string | null;
  refreshFrequency: string | null;
  status: string;
  notes: string | null;
}> = [
  {
    id: "seed-ds-core-los",
    name: "Core LOS",
    businessOwner: "Loan Ops",
    businessUnit: "All units",
    format: "Relational DB (vendor)",
    location: "On-prem primary DC",
    accessMethod: "VPN + read replica",
    refreshMethod: "CDC / nightly batch (TBD)",
    refreshFrequency: "Daily (working days)",
    status: "inventory",
    notes: "Primary application & servicing facts; HKID keyed.",
  },
  {
    id: "seed-ds-credit-bureau",
    name: "Credit bureau extracts",
    businessOwner: "Risk",
    businessUnit: "Central",
    format: "Encrypted flat files",
    location: "Secure SFTP inbox",
    accessMethod: "Scheduled pull",
    refreshMethod: "Email / SFTP drop",
    refreshFrequency: "Weekly + ad-hoc",
    status: "inventory",
    notes: "Third-party; align on HKID / consent flags.",
  },
  {
    id: "seed-ds-collections-crm",
    name: "Collections CRM notes",
    businessOwner: "Collections",
    businessUnit: "Unit B",
    format: "SaaS API + export",
    location: "Vendor cloud",
    accessMethod: "Service account",
    refreshMethod: "API sync stub in portal",
    refreshFrequency: "Daily target",
    status: "planned",
    notes: "Phone masking rules apply at presentation layer.",
  },
];

function profileToRecord(p: (typeof profiles)[0]): Prisma.CustomerRecordCreateInput {
  const row = p.searchRow;
  return {
    id: p.id,
    hkid: row.idNumber,
    name: row.name,
    rawMobile: row.mobile,
    status: row.status,
    loanType: row.loanType,
    applicationNumber: row.applicationNumber,
    loanNumber: row.loanNumber,
    applyDate: row.applyDate,
    partakerType: row.partakerType,
    blacklistFlag: row.blacklistFlag,
    sourceSystem: row.sourceSystem,
    age: row.age,
    job: row.job,
    companyUnit: row.companyUnit,
    profileJson: JSON.parse(JSON.stringify(p)) as Prisma.InputJsonValue,
  };
}

async function main() {
  const adminEmail = (process.env.SEED_ADMIN_EMAIL ?? "admin@deviewai.local").toLowerCase();
  const adminPass = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMeAdmin!1";
  const staffEmail = (process.env.SEED_STAFF_EMAIL ?? "staff@deviewai.local").toLowerCase();
  const staffPass = process.env.SEED_STAFF_PASSWORD ?? "ChangeMeStaff!1";
  const viewerEmail = (process.env.SEED_VIEWER_EMAIL ?? "viewer@deviewai.local").toLowerCase();
  const viewerPass = process.env.SEED_VIEWER_PASSWORD ?? "ChangeMeViewer!1";

  const adminHash = await bcrypt.hash(adminPass, 10);
  const staffHash = await bcrypt.hash(staffPass, 10);
  const viewerHash = await bcrypt.hash(viewerPass, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    create: {
      email: adminEmail,
      passwordHash: adminHash,
      name: "Portal Admin",
      role: Role.ADMIN,
    },
    update: { passwordHash: adminHash, role: Role.ADMIN, name: "Portal Admin" },
  });

  await prisma.user.upsert({
    where: { email: staffEmail },
    create: {
      email: staffEmail,
      passwordHash: staffHash,
      name: "Staff User",
      role: Role.STAFF,
    },
    update: { passwordHash: staffHash, role: Role.STAFF, name: "Staff User" },
  });

  await prisma.user.upsert({
    where: { email: viewerEmail },
    create: {
      email: viewerEmail,
      passwordHash: viewerHash,
      name: "Viewer",
      role: Role.VIEWER,
    },
    update: { passwordHash: viewerHash, role: Role.VIEWER, name: "Viewer" },
  });

  for (const ds of defaultDataSources) {
    await prisma.dataSource.upsert({
      where: { id: ds.id },
      create: ds,
      update: {
        name: ds.name,
        businessOwner: ds.businessOwner,
        businessUnit: ds.businessUnit,
        format: ds.format,
        location: ds.location,
        accessMethod: ds.accessMethod,
        refreshMethod: ds.refreshMethod,
        refreshFrequency: ds.refreshFrequency,
        status: ds.status,
        notes: ds.notes,
      },
    });
  }

  for (const p of profiles) {
    const data = profileToRecord(p);
    await prisma.customerRecord.upsert({
      where: { id: p.id },
      create: data,
      update: {
        hkid: data.hkid,
        name: data.name,
        rawMobile: data.rawMobile,
        status: data.status,
        loanType: data.loanType,
        applicationNumber: data.applicationNumber,
        loanNumber: data.loanNumber,
        applyDate: data.applyDate,
        partakerType: data.partakerType,
        blacklistFlag: data.blacklistFlag,
        sourceSystem: data.sourceSystem,
        age: data.age,
        job: data.job,
        companyUnit: data.companyUnit,
        profileJson: data.profileJson,
      },
    });
  }

  console.info("Seed OK: users + data sources + customer records from mock profiles.");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
