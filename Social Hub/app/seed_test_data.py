"""Insert sample test data for development/testing."""
import argparse
from datetime import datetime, timezone, timedelta

from sqlmodel import Session, select, func, col

from app.database import (
    engine, init_db, Post, PostStatus, Platform,
    LinkedInAccount, InstagramAccount, AppLog,
    TopicIdea, DynamicSetting, get_setting,
)
from app.config import settings


def seed_test_data(reset: bool = False, allow_production_seed: bool = False):
    if settings.APP_ENV == "production" and not allow_production_seed:
        raise SystemExit(
            "Refusing to seed sample data into the production schema. Switch APP_ENV=test or pass --allow-production-seed intentionally."
        )

    init_db(reset=reset)

    with Session(engine) as s:
        li_posts = [
            Post(
                platform=Platform.LINKEDIN,
                topic="IT Skills Shortage in 2026",
                body="The IT skills shortage has intensified in 2026. According to a recent study, over 150,000 IT professionals are needed.\n\nMost in-demand roles:\n- Software Developers\n- Cloud Architects\n- AI Specialists\n- IT Test Managers\n\n63% of companies report IT vacancies open for 6+ months. This costs the economy an estimated $20 billion annually.\n\nThe good news: Career changers have better chances than ever. Certified IT training programs show an employment rate of 89% within 6 months.\n\nHow does the skills shortage affect your company?",
                sources="Industry Skills Report 2026\nBureau of Labor Statistics",
                hashtags="#SkillsShortage #IT #Careers #Upskilling #TechJobs",
                image_prompt="Professional infographic showing IT talent shortage",
                value_comment="Interesting fact: demand for IT test management skills is growing 34% year-over-year.",
                status=PostStatus.DRAFT,
            ),
            Post(
                platform=Platform.LINKEDIN,
                topic="AI Upskilling for Career Changers",
                body="AI is fundamentally changing the job market. Instead of fear, we should see the opportunities.\n\n85% of employers plan to offer AI training within the next 2 years according to McKinsey.\n\nTop AI courses in 2026:\n1. Prompt Engineering\n2. AI-Powered Test Management\n3. Data Analytics with AI\n4. AI Project Management\n\nMany of these courses require no programming background. Career changers can earn a recognized certification in 3-6 months part-time.\n\nWhat AI skills do you want to learn next?",
                sources="McKinsey Global Survey on AI 2026",
                hashtags="#AI #Upskilling #CareerChange #FutureOfWork",
                image_prompt="Futuristic classroom with AI learning visualizations",
                value_comment="Tip: Many government programs now fund AI upskilling courses at up to 100% of costs.",
                status=PostStatus.APPROVED,
            ),
            Post(
                platform=Platform.LINKEDIN,
                topic="ISTQB Certification: Still Worth It?",
                body="The ISTQB certification celebrates its 25th anniversary this year. But is it still relevant?\n\nClear answer: Yes, more than ever!\n\nThe numbers speak for themselves:\n- 900,000+ certified testers worldwide\n- 23% higher salary on average vs non-certified testers\n- 92% of IT recruiters consider ISTQB a quality indicator\n\nNew modules covering AI-powered testing and agile methods make the certification future-proof.\n\nMy tip: Start with the Foundation Level and build up from there.\n\nDo you have an ISTQB certification?",
                sources="ISTQB Annual Report 2025\nSalary Survey 2026",
                hashtags="#ISTQB #TestManagement #Certification #QA #Careers",
                image_prompt="Professional certification badge with test automation icons",
                value_comment="WAMOCON offers workshops for ISTQB exam preparation.",
                status=PostStatus.PUBLISHED,
                published_at=datetime.now(timezone.utc) - timedelta(days=3),
                platform_post_id="urn:li:share:7123456789",
            ),
            Post(
                platform=Platform.LINKEDIN,
                topic="Remote Work vs. Office: What the Data Says",
                body="The remote vs. office debate enters a new round in 2026.\n\nNew data shows:\n- 34% of employees work at least partially remote\n- Hybrid models (2-3 office days) are most popular at 52%\n- Fully remote: only 12% (down from 18% in 2024)\n\nInteresting: IT professionals with remote options earn 8% less on average than comparable office positions.\n\nWhat does your current work model look like?",
                sources="Workforce Analytics Report Q1/2026",
                hashtags="#RemoteWork #Hybrid #FutureOfWork #NewWork",
                image_prompt="Split view of home office and modern office workspace",
                status=PostStatus.FAILED,
                notes="Publish error: LinkedIn API returned 401 Unauthorized",
            ),
            Post(
                platform=Platform.LINKEDIN,
                topic="Salary Negotiation: 5 Tips That Actually Work",
                body="Salary negotiations are among the most dreaded conversations. 67% of employees never negotiate their salary.\n\nYet studies show: Those who negotiate earn 11% more on average.\n\nMy top 5 tips:\n\n1. Research market salaries (Glassdoor, LinkedIn, Levels.fyi)\n2. List 3 concrete achievements from the last 12 months\n3. Name a range, not a fixed number\n4. Timing: After a project success, not during annual review\n5. Practice with a trusted colleague\n\nWhen did you last negotiate your salary?",
                sources="Salary Report 2026\nRobert Half Salary Guide",
                hashtags="#SalaryNegotiation #CareerTips #Salary #Careers",
                image_prompt="Professional meeting room negotiation scene",
                value_comment="Additional tip: Certifications like ISTQB or Scrum Master can be leveraged in negotiations.",
                status=PostStatus.REJECTED,
            ),
        ]

        ig_posts = [
            Post(
                platform=Platform.INSTAGRAM,
                topic="5 AI Tools You Need in 2026",
                body="5 AI tools every professional should know in 2026 \U0001F680\n\n1\uFE0F\u20E3 ChatGPT — Your brainstorming partner\n2\uFE0F\u20E3 Midjourney — Visual content creation\n3\uFE0F\u20E3 Cursor — AI-powered coding\n4\uFE0F\u20E3 NotebookLM — Research & learning\n5\uFE0F\u20E3 Gamma — Presentation design\n\nWhich ones are you already using? Drop a comment! \U0001F447\n\n#AITools #Productivity #TechTrends #2026 #AI #FutureOfWork #CareerGrowth #Innovation #TechLife #DigitalSkills",
                sources="Product Hunt Top AI 2026",
                hashtags="#AITools #Productivity #TechTrends #2026 #AI",
                image_prompt="Colorful flat lay of AI tool icons on gradient background, square format, bold typography",
                value_comment="Which tool surprised you most? Mine is NotebookLM!",
                status=PostStatus.DRAFT,
                ig_media_type="IMAGE",
            ),
            Post(
                platform=Platform.INSTAGRAM,
                topic="Morning Routine for Productivity",
                body="My morning routine that changed everything \u2615\n\n\u23F0 5:30 — Wake up (no snooze!)\n\U0001F4D6 5:45 — Read for 20 minutes\n\U0001F9D8 6:05 — Meditate 10 minutes\n\U0001F4DD 6:15 — Journal 3 gratitudes\n\U0001F3CB 6:30 — 30 min workout\n\U0001F373 7:00 — Healthy breakfast\n\U0001F4BB 7:30 — Deep work block\n\nThe first 2 hours set the tone for the entire day.\n\nSave this for tomorrow morning! \U0001F516\n\n#MorningRoutine #Productivity #SelfImprovement #Habits #Success",
                sources="Atomic Habits, James Clear",
                hashtags="#MorningRoutine #Productivity #SelfImprovement #Habits",
                image_prompt="Aesthetic flat design morning routine infographic, pastel colors, square format",
                value_comment="What's the ONE habit that changed your mornings most?",
                status=PostStatus.APPROVED,
                ig_media_type="IMAGE",
            ),
            Post(
                platform=Platform.INSTAGRAM,
                topic="Tech Career Myths Busted",
                body="3 tech career myths BUSTED \U0001F4A5\n\nMyth 1: You need a CS degree\n\u2714\uFE0F Reality: 40% of developers are self-taught\n\nMyth 2: You have to code every day\n\u2714\uFE0F Reality: Consistency > intensity. 3-4x/week is great\n\nMyth 3: It's too late to switch careers\n\u2714\uFE0F Reality: Average career changer is 35+ and thriving\n\nStop letting myths hold you back! \U0001F4AA\n\nTag someone who needs to hear this \U0001F447\n\n#TechCareers #CodingLife #CareerChange #MythBusters #Developer #Programming #TechJobs #SoftwareEngineer #LearnToCode #CodeNewbie",
                sources="Stack Overflow Developer Survey 2026",
                hashtags="#TechCareers #CodingLife #CareerChange #MythBusters",
                image_prompt="Bold text overlay myth vs reality comparison, vibrant pink and blue gradient background, square",
                value_comment="Which myth held you back the longest?",
                status=PostStatus.PUBLISHED,
                published_at=datetime.now(timezone.utc) - timedelta(days=1),
                platform_post_id="17895695823156789",
                ig_media_type="IMAGE",
            ),
        ]

        for post in li_posts + ig_posts:
            s.add(post)
        s.commit()
        print(f"Inserted {len(li_posts)} LinkedIn + {len(ig_posts)} Instagram sample posts")

        topics = [
            TopicIdea(topic="Agile transformation in mid-size companies"),
            TopicIdea(topic="The future of IT test management with AI"),
            TopicIdea(topic="Burnout prevention for IT professionals"),
            TopicIdea(topic="Women reshaping the tech industry", used=True),
            TopicIdea(topic="DevOps culture: More than just tools"),
        ]
        for topic in topics:
            s.add(topic)
        s.commit()
        print(f"Inserted {len(topics)} sample topics")

        s.add(
            LinkedInAccount(
                name="Demo Account (LinkedIn)",
                linkedin_user_id="test_12345",
                access_token=None,
                is_active=True,
            )
        )
        s.add(
            InstagramAccount(
                username="demo_socialhub",
                ig_user_id="17841400123456",
                access_token=None,
                is_active=True,
            )
        )
        s.commit()
        print("Inserted sample LinkedIn account")
        print("Inserted sample Instagram account")

        logs = [
            AppLog(level="INFO", source="scheduler", message="Scheduler started: LI publish days=1,3 @09:00, IG publish days=0,2,4 @10:00"),
            AppLog(level="INFO", source="scheduler", message="Draft generated: ISTQB Certification (LinkedIn, Post #3)"),
            AppLog(level="INFO", source="linkedin", message="Published Post #3: urn:li:share:7123456789"),
            AppLog(level="INFO", source="scheduler", message="Draft generated: Tech Career Myths (Instagram, Post #8)"),
            AppLog(level="INFO", source="instagram", message="Published Post #8: 17895695823156789"),
            AppLog(level="WARNING", source="scheduler", message="LinkedIn pipeline full (3/3) - skipping generation."),
            AppLog(level="ERROR", source="linkedin", message="Publish failed for Post #4: 401 Unauthorized"),
            AppLog(level="INFO", source="linkedin", message="Value comment posted on Post #3"),
            AppLog(level="INFO", source="app", message="Settings saved by user."),
        ]
        for log_entry in logs:
            s.add(log_entry)
        s.commit()
        print(f"Inserted {len(logs)} sample logs")

        print(f"\nLI Posting days: {get_setting('posting_days', 'N/A')}")
        print(f"IG Posting days: {get_setting('ig_posting_days', 'N/A')}")
        print(f"Gemini model: {get_setting('gemini_model', 'N/A')}")
        print(f"Auto-generate LI: {get_setting('auto_generate_drafts', 'N/A')}")
        print(f"Auto-generate IG: {get_setting('ig_auto_generate_drafts', 'N/A')}")

        post_count = s.exec(select(func.count(col(Post.id)))).one()
        topic_count = s.exec(select(func.count(col(TopicIdea.id)))).one()
        log_count = s.exec(select(func.count(col(AppLog.id)))).one()
        setting_count = s.exec(select(func.count(col(DynamicSetting.key)))).one()
        print("\n=== DB Summary ===")
        print(f"Posts: {post_count} ({len(li_posts)} LinkedIn + {len(ig_posts)} Instagram)")
        print(f"Topics: {topic_count}")
        print(f"Logs: {log_count}")
        print(f"Settings: {setting_count}")
        print("LinkedIn Accounts: 1")
        print("Instagram Accounts: 1")
        print("ALL SAMPLE DATA INSERTED SUCCESSFULLY")


def main():
    parser = argparse.ArgumentParser(description="Seed SocialHub test data")
    parser.add_argument("--reset", action="store_true", help="Reset all tables before seeding")
    parser.add_argument(
        "--allow-production-seed",
        action="store_true",
        help="Allow seeding sample data into the production schema intentionally",
    )
    args = parser.parse_args()
    seed_test_data(reset=args.reset, allow_production_seed=args.allow_production_seed)


if __name__ == "__main__":
    main()
