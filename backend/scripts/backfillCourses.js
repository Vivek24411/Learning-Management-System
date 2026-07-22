/**
 * Backfill for courses created before the creator / request-enrollment feature.
 *
 * Older courses have no `creator`, so nobody owns them: the owner-only
 * "Enrollment Requests" panel cannot appear and no teacher name is shown.
 * This assigns an owner and (optionally) sets the enrollment type.
 *
 * Usage, from the backend/ directory:
 *   node scripts/backfillCourses.js --owner=<email>                  # dry run
 *   node scripts/backfillCourses.js --owner=<email> --type=request --apply
 *
 * Flags:
 *   --owner=<email>  user who becomes creator/teacher of un-owned courses (required)
 *   --type=request|paid  also set enrollmentType on those courses (optional)
 *   --all            include courses that already have an owner
 *   --apply          actually write; without it nothing is modified
 */
require("dotenv").config();
const mongoose = require("mongoose");
const userModel = require("../src/models/user.model");
const courseModel = require("../src/models/course.model");

const args = process.argv.slice(2);
const getFlag = (name) => {
  const hit = args.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split("=").slice(1).join("=") : null;
};
const has = (name) => args.includes(`--${name}`);

const ownerEmail = getFlag("owner");
const type = getFlag("type");
const apply = has("apply");
const all = has("all");

(async () => {
  if (!ownerEmail) {
    console.error("Missing --owner=<email>. See the header of this file for usage.");
    process.exit(1);
  }
  if (type && !["paid", "request"].includes(type)) {
    console.error("--type must be 'paid' or 'request'");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log(`Connected to "${mongoose.connection.name}"`);
  console.log(apply ? "MODE: APPLY (writing changes)\n" : "MODE: DRY RUN (no changes written)\n");

  const owner = await userModel.findOne({ email: ownerEmail });
  if (!owner) {
    console.error(`No user found with email ${ownerEmail}`);
    await mongoose.disconnect();
    process.exit(1);
  }
  console.log(`Owner: ${owner.name} <${owner.email}>\n`);

  const filter = all ? {} : { $or: [{ creator: { $exists: false } }, { creator: null }] };
  const courses = await courseModel.find(filter);

  if (courses.length === 0) {
    console.log("No courses need backfilling.");
    await mongoose.disconnect();
    return;
  }

  for (const course of courses) {
    const changes = [];
    if (!course.creator || all) {
      changes.push(`creator -> ${owner.name}`);
      course.creator = owner._id;
      course.creatorName = owner.name;
    }
    if (type && course.enrollmentType !== type) {
      changes.push(`enrollmentType ${course.enrollmentType || "unset"} -> ${type}`);
      course.enrollmentType = type;
    }

    console.log(`"${course.courseName}" (price ₹${course.price ?? 0})`);
    changes.forEach((c) => console.log(`    ${c}`));
    if (changes.length === 0) console.log("    (nothing to change)");

    if (apply && changes.length) await course.save();
  }

  console.log(
    apply
      ? `\nDone. ${courses.length} course(s) processed.`
      : `\nDry run complete. Re-run with --apply to write these changes.`
  );
  await mongoose.disconnect();
})().catch((e) => {
  console.error("Backfill failed:", e.message);
  process.exit(1);
});
