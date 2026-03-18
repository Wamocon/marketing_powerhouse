// Re-export all data from split modules for backward compatibility
export { testUsers, currentUser } from './users';
export { companyPositioning, companyKeywords, audiences } from './positioning';
export {
    campaigns, initialTasks, initialContents, CONTENT_TYPE_COLORS,
} from './campaigns';
export {
    budgetData, activityFeed, teamMembers, dashboardChartData,
    channelPerformance, touchpoints,
} from './dashboard';
export { asidasJourneys, customerJourneys } from './journeys';
