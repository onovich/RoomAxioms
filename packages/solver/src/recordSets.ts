import type { PuzzleDefinition, RecordSetRule, RuleDefinition } from '@room-axioms/domain';

export interface RecordSetAssignment {
  readonly id: string;
  readonly falseRecordIds: readonly string[];
  readonly activeRuleIds: readonly string[];
  readonly puzzle: PuzzleDefinition;
}

export function hasRecordSetRules(puzzle: PuzzleDefinition): boolean {
  return puzzle.rules.some(isRecordSetRule);
}

export function expandRecordSetAssignments(puzzle: PuzzleDefinition): readonly RecordSetAssignment[] {
  const recordSetRules = puzzle.rules.filter(isRecordSetRule);
  if (recordSetRules.length === 0) {
    return [{
      id: 'all-records-true',
      falseRecordIds: [],
      activeRuleIds: puzzle.rules.map((rule) => rule.id),
      puzzle,
    }];
  }

  const candidateRecordIds = unique(recordSetRules.flatMap((rule) => rule.recordIds));
  const recordsById = new Map((puzzle.records ?? []).map((record) => [record.id, record]));

  return enumerateSubsets(candidateRecordIds)
    .filter((falseRecordIds) =>
      recordSetRules.every((rule) => recordSetRuleAllowsFalseRecords(rule, falseRecordIds)),
    )
    .map((falseRecordIds) => {
      const falseRuleIds = new Set<string>();
      for (const recordId of falseRecordIds) {
        for (const ruleId of recordsById.get(recordId)?.ruleIds ?? []) {
          falseRuleIds.add(ruleId);
        }
      }

      const activeRules = puzzle.rules.filter(
        (rule) => rule.type !== 'recordSet' && !falseRuleIds.has(rule.id),
      );

      return {
        id: falseRecordIds.length === 0 ? 'none-false' : falseRecordIds.join('+'),
        falseRecordIds,
        activeRuleIds: activeRules.map((rule) => rule.id),
        puzzle: {
          ...puzzle,
          rules: activeRules,
        },
      };
    });
}

function isRecordSetRule(rule: RuleDefinition): rule is RecordSetRule {
  return rule.type === 'recordSet';
}

function recordSetRuleAllowsFalseRecords(
  rule: RecordSetRule,
  falseRecordIds: readonly string[],
): boolean {
  const falseSet = new Set(falseRecordIds);
  const falseCount = rule.recordIds.filter((recordId) => falseSet.has(recordId)).length;

  switch (rule.falseRecords.op) {
    case 'eq':
      return falseCount === rule.falseRecords.value;
    case 'lte':
      return falseCount <= rule.falseRecords.value;
  }
}

function enumerateSubsets(values: readonly string[]): readonly (readonly string[])[] {
  const subsets: string[][] = [[]];

  for (const value of values) {
    const length = subsets.length;
    for (let index = 0; index < length; index += 1) {
      subsets.push([...subsets[index], value]);
    }
  }

  return subsets.map((subset) => subset.sort());
}

function unique(values: readonly string[]): readonly string[] {
  return [...new Set(values)].sort();
}
