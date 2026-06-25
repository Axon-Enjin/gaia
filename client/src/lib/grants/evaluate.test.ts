import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { GrantCriteria } from "@/lib/grants/criteria-schema";
import { canonicalizeCriteria, hashCriteria } from "@/lib/grants/criteria-hash";
import {
  filterEligibleRecipients,
  type LearnerMeritRow,
} from "@/lib/grants/evaluate";

const baseCriteria: GrantCriteria = {
  industry: "Agriculture",
  min_xp: 300,
  required_badges: ["consistent_learner"],
  require_credential: false,
};

const maricel: LearnerMeritRow = {
  learner_id: "a1111111-1111-4111-8111-111111111101",
  display_name: "Maricel Bautista",
  total_xp: 425,
  badge_types: ["consistent_learner", "course_complete"],
  completed_industries: ["Agriculture"],
  credential_industries: ["Agriculture"],
};

const lowXp: LearnerMeritRow = {
  learner_id: "a1111111-1111-4111-8111-111111111102",
  display_name: "Rico Mendoza",
  total_xp: 200,
  badge_types: ["consistent_learner"],
  completed_industries: ["Agriculture"],
  credential_industries: [],
};

const wrongIndustry: LearnerMeritRow = {
  learner_id: "a1111111-1111-4111-8111-111111111103",
  display_name: "Lia Santos",
  total_xp: 500,
  badge_types: ["consistent_learner"],
  completed_industries: ["Finance"],
  credential_industries: [],
};

describe("filterEligibleRecipients", () => {
  it("matches learner meeting industry, XP, and badge", () => {
    const result = filterEligibleRecipients(
      [maricel, lowXp, wrongIndustry],
      baseCriteria,
    );
    assert.equal(result.length, 1);
    assert.equal(result[0].learner_id, maricel.learner_id);
    assert.equal(result[0].matched_industry, "Agriculture");
  });

  it("excludes learner below min_xp threshold", () => {
    const result = filterEligibleRecipients([lowXp], baseCriteria);
    assert.equal(result.length, 0);
  });

  it("excludes learner with wrong industry", () => {
    const result = filterEligibleRecipients([wrongIndustry], baseCriteria);
    assert.equal(result.length, 0);
  });

  it("includes learner at exact min_xp", () => {
    const exact = { ...maricel, total_xp: 300 };
    const result = filterEligibleRecipients([exact], baseCriteria);
    assert.equal(result.length, 1);
  });

  it("requires credential when flag set", () => {
    const noCred = { ...maricel, credential_industries: [] as string[] };
    const criteria: GrantCriteria = {
      ...baseCriteria,
      require_credential: true,
    };
    assert.equal(filterEligibleRecipients([noCred], criteria).length, 0);
    assert.equal(filterEligibleRecipients([maricel], criteria).length, 1);
  });

  it("sorts by total_xp descending", () => {
    const a = { ...maricel, total_xp: 400 };
    const b = { ...maricel, learner_id: "b", total_xp: 900 };
    const result = filterEligibleRecipients([a, b], {
      ...baseCriteria,
      required_badges: [],
    });
    assert.equal(result[0].total_xp, 900);
    assert.equal(result[1].total_xp, 400);
  });
});

describe("criteria hash", () => {
  it("produces stable hash for equivalent criteria", () => {
    const a: GrantCriteria = {
      industry: "Agriculture",
      min_xp: 300,
      required_badges: ["consistent_learner"],
      require_credential: false,
    };
    const b: GrantCriteria = {
      industry: " Agriculture ",
      min_xp: 300,
      required_badges: ["consistent_learner"],
      require_credential: false,
    };
    assert.equal(canonicalizeCriteria(a), canonicalizeCriteria(b));
    assert.equal(hashCriteria(a), hashCriteria(b));
  });
});
