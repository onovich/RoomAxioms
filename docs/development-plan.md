# Room Axioms Development Plan

日期：2026-06-23  
用途：给架构线程、执行线程和验收线程共享的阶段计划与会话轮数预算。

## 轮数定义

一轮执行者会话指：读取本阶段指南，完成一个小目标，运行该轮要求的验证，提交并推送，最后汇报本轮结果。

架构与验收线程不计入下表的执行者轮数。通常每个阶段还需要 1-2 轮架构/验收会话，用于 PASS 检查、修复派发和下一阶段指南生成。

## 阶段计划

| Phase | 范围 | 对应 backlog | 预算 |
|---|---|---|---:|
| Phase 0 - Prototype Baseline | 接收 handoff、初始化 repo、发布当前 web prototype、保留原始 docs 与原型资产 | RA-001 + prototype publication | 已完成 |
| Phase 1 - Domain Core Package | 建立 `@room-axioms/domain`，抽出坐标、棋盘、邻域、规则类型、事件与纯 reducer，并保持当前 UI 行为不变 | RA-002 | 8 轮 |
| Phase 2 - Schema And Content Contract | 建立 Puzzle Schema v1、Zod 校验、错误诊断、fixture 规范和 case-004 数据迁移 | RA-003 | 6 轮 |
| Phase 3 - Oracle And Verification Harness | 实现小规模 brute-force oracle、与手算 fixture 对齐、形成回归测试基线 | RA-004 | 7 轮 |
| Phase 4 - Solver Core And Queries | 实现有限域 CSP core、候选世界、forced-cell、唯一访客布局、计数与性能预算 | RA-005, RA-006 | 10 轮 |
| Phase 5 - Human Reasoning And Proofs | 实现人类推理 v1、proof DAG、proof renderer、零猜测验证器和 case-004 可解释通关链 | RA-007, RA-008, RA-010 | 10 轮 |
| Phase 6 - Web Runtime Integration | 将 solver/proof 接入 Worker、提示、developer inspector、进度与错误状态，保持 UI 主流程稳定 | RA-009, RA-010, RA-012, RA-016 | 8 轮 |
| Phase 7 - MVP Content And UX Hardening | 制作首批 10 关、三内核 E2E、键盘/屏幕阅读器、响应式、性能基准和规则措辞修订 | RA-011, RA-013, RA-014, RA-015, RA-018, RA-019, RA-020 | 10 轮 |
| Phase 8 - Release QA And Playtest Loop | Pages 发布验收、试玩研究、数据整理、P0/P1 缺陷修复、MVP 发布判定 | RA-017 + release gates | 6 轮 |
| Phase 9 - Generator And Expansion Spike | 生成器 v1、初始揭示最小化、难度评分、技巧扩充、内部编辑器和后续 scope 研究 | RA-021 to RA-028 | 8 轮探索预算 |

## 当前执行状态

- 当前 active phase：Phase 1 - Domain Core Package
- 执行指南：`docs/phase-1-domain-core-goal-mode-execution-guide.md`
- 执行者预算：8 轮
- 派发状态：已派发给执行者线程 `019ef271-256c-7be2-9663-e658e2378564`

## 总预算

- MVP 前主要执行预算：65 轮，覆盖 Phase 1 到 Phase 8。
- 扩展探索预算：8 轮，覆盖 Phase 9。
- 规划/验收额外预算：每个 phase 约 1-2 轮，MVP 前约 8-16 轮。
