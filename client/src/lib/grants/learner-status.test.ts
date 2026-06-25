import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { GrantCriteria } from "@/lib/grants/criteria-schema";
import type { LearnerMeritRow } from "@/lib/grants/evaluate";
import {
  buildLearnerGrantStatusCards,
  getLearnerGrantStatus,
  selectLatestDisbursements,
  type LatestGrantDisbursement,
  type LearnerGrantProgram,
} from "@/lib/grants/learner-status";

const learnerId = "a1111111-1111-4111-8111-111111111101";

const baseSnapshot: LearnerMeritRow = {
  learner_id: learnerId,
  display_name: "Maricel",
  total_xp: 450,
  badge_types: ["consistent_learner", "course_complete"],
  completed_industries: ["Agriculture"],
  credential_industries: ["Agriculture"],
};

const baseCriteria: GrantCriteria = {
  industry: "Agriculture",
  min_xp: 300,
  required_badges: ["consistent_learner"],
  require_credential: false,
};

function makeProgram(
  id: string,
  criteria: GrantCriteria,
): LearnerGrantProgram {
  return {
    id,
    name: `Program ${id}`,
    criteria,
    amountPerLearner: 2500,
  };
}

function makeDisbursement(
  programId: string,
  createdAt: string,
  recipients: unknown,
): LatestGrantDisbursement {
  return { programId, createdAt, recipients };
}

describe("buildLearnerGrantStatusCards", () => {
  it("includes learner who is eligible now without disbursement history", () => {
    const cards = buildLearnerGrantStatusCards(
      learnerId,
      [makeProgram("p1", baseCriteria)],
      baseSnapshot,
      new Map(),
    );

    assert.equal(cards.length, 1);
    assert.equal(cards[0].eligibleNow, true);
    assert.equal(cards[0].includedInLatestSimulation, false);
    assert.equal(cards[0].latestSimulationAt, null);
  });

  it("marks learner included in latest simulation", () => {
    const latest = selectLatestDisbursements([
      makeDisbursement("p1", "2026-06-24T10:00:00.000Z", [
        { learner_id: learnerId },
      ]),
    ]);

    const cards = buildLearnerGrantStatusCards(
      learnerId,
      [makeProgram("p1", baseCriteria)],
      baseSnapshot,
      latest,
    );

    assert.equal(cards.length, 1);
    assert.equal(cards[0].includedInLatestSimulation, true);
  });

  it("keeps program when learner is no longer eligible but was included in latest simulation", () => {
    const lowXpSnapshot: LearnerMeritRow = {
      ...baseSnapshot,
      total_xp: 100,
    };
    const strictCriteria: GrantCriteria = {
      ...baseCriteria,
      min_xp: 300,
    };
    const latest = selectLatestDisbursements([
      makeDisbursement("p1", "2026-06-24T10:00:00.000Z", [
        { learner_id: learnerId },
      ]),
    ]);

    const cards = buildLearnerGrantStatusCards(
      learnerId,
      [makeProgram("p1", strictCriteria)],
      lowXpSnapshot,
      latest,
    );

    assert.equal(cards.length, 1);
    assert.equal(cards[0].eligibleNow, false);
    assert.equal(cards[0].includedInLatestSimulation, true);
  });

  it("excludes credential-required program when learner lacks credential and has no disbursement history", () => {
    const noCredentialSnapshot: LearnerMeritRow = {
      ...baseSnapshot,
      credential_industries: [],
    };
    const requiresCredential: GrantCriteria = {
      ...baseCriteria,
      require_credential: true,
    };

    const cards = buildLearnerGrantStatusCards(
      learnerId,
      [makeProgram("p1", requiresCredential)],
      noCredentialSnapshot,
      new Map(),
    );

    assert.equal(cards.length, 0);
  });
});

describe("selectLatestDisbursements", () => {
  it("chooses the latest disbursement record per program", () => {
    const latest = selectLatestDisbursements([
      makeDisbursement("p1", "2026-06-20T10:00:00.000Z", [
        { learner_id: learnerId },
      ]),
      makeDisbursement("p1", "2026-06-24T10:00:00.000Z", []),
    ]);

    const row = latest.get("p1");
    assert.ok(row);
    assert.equal(row.createdAt, "2026-06-24T10:00:00.000Z");
  });
});

describe("getLearnerGrantStatus", () => {
  it("returns unavailable instead of throwing when service role key is missing", async () => {
    const result = await getLearnerGrantStatus(learnerId, {
      serviceRoleKey: "",
    });

    assert.equal(result.available, false);
    assert.equal(result.errorCode, "service_unavailable");
    assert.equal(result.cards.length, 0);
  });
});
