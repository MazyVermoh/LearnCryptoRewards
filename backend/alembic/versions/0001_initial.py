"""initial schema

Revision ID: 0001_initial
Revises: 
Create Date: 2025-01-07 00:00:00
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None


course_category = sa.Enum(
    "mind-thinking",
    "finance-economics",
    "career-skills",
    "future-thinking",
    "health-body",
    name="course_category",
)

book_category = sa.Enum(
    "psychology-thinking-development",
    "financial-literacy-economics",
    "marketing",
    "health-fitness-nutrition",
    "communication-soft-skills",
    "entrepreneurship-career",
    "technology-future",
    "relationships",
    "popular-personalities",
    name="book_category",
)

transaction_type = sa.Enum(
    "reward",
    "purchase",
    "referral",
    "steps",
    "subscription",
    name="transaction_type",
)


def upgrade() -> None:
    bind = op.get_bind()
    course_category.create(bind, checkfirst=True)
    book_category.create(bind, checkfirst=True)
    transaction_type.create(bind, checkfirst=True)

    op.create_table(
        "sessions",
        sa.Column("sid", sa.String(), nullable=False),
        sa.Column("sess", sa.JSON(), nullable=False),
        sa.Column("expire", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("sid"),
    )
    op.create_index("IDX_session_expire", "sessions", ["expire"], unique=False)

    op.create_table(
        "users",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("email", sa.String(), nullable=True),
        sa.Column("first_name", sa.String(), nullable=True),
        sa.Column("last_name", sa.String(), nullable=True),
        sa.Column("profile_image_url", sa.String(), nullable=True),
        sa.Column(
            "token_balance",
            sa.Numeric(precision=10, scale=2),
            server_default=sa.text("0"),
            nullable=False,
        ),
        sa.Column("daily_steps", sa.Integer(), server_default=sa.text("0"), nullable=False),
        sa.Column("level", sa.Integer(), server_default=sa.text("1"), nullable=False),
        sa.Column("referral_code", sa.String(), nullable=True),
        sa.Column("referred_by", sa.String(), nullable=True),
        sa.Column("language", sa.String(), server_default=sa.text("'en'"), nullable=False),
        sa.Column(
            "created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False
        ),
        sa.Column(
            "updated_at", sa.DateTime(), server_default=sa.func.now(), nullable=False
        ),
        sa.ForeignKeyConstraint(["referred_by"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
        sa.UniqueConstraint("referral_code"),
    )

    op.create_table(
        "courses",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("title_ru", sa.String(), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("description_ru", sa.Text(), nullable=True),
        sa.Column("content", sa.Text(), nullable=True),
        sa.Column("content_ru", sa.Text(), nullable=True),
        sa.Column("instructor", sa.String(), nullable=False),
        sa.Column("instructor_ru", sa.String(), nullable=True),
        sa.Column("category", course_category, nullable=False),
        sa.Column("price", sa.Numeric(precision=10, scale=2), server_default=sa.text("0")),
        sa.Column("rating", sa.Numeric(precision=3, scale=2), server_default=sa.text("0")),
        sa.Column("review_count", sa.Integer(), server_default=sa.text("0")),
        sa.Column("image_url", sa.String(), nullable=True),
        sa.Column("duration", sa.Integer(), nullable=True),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true")),
        sa.Column("is_visible", sa.Boolean(), server_default=sa.text("true")),
        sa.Column(
            "created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False
        ),
        sa.Column(
            "updated_at", sa.DateTime(), server_default=sa.func.now(), nullable=False
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "books",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("title_ru", sa.String(), nullable=True),
        sa.Column("author", sa.String(), nullable=False),
        sa.Column("author_ru", sa.String(), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("description_ru", sa.Text(), nullable=True),
        sa.Column("category", book_category, nullable=False),
        sa.Column("price", sa.Numeric(precision=10, scale=2), server_default=sa.text("0")),
        sa.Column("cover_image_url", sa.String(), nullable=True),
        sa.Column("file_url", sa.String(), nullable=True),
        sa.Column("page_count", sa.Integer(), nullable=True),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true")),
        sa.Column("is_visible", sa.Boolean(), server_default=sa.text("true")),
        sa.Column(
            "created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False
        ),
        sa.Column(
            "updated_at", sa.DateTime(), server_default=sa.func.now(), nullable=False
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "sponsor_channels",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("channel_url", sa.String(), nullable=False),
        sa.Column("reward", sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true")),
        sa.Column(
            "created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "text_content",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("key", sa.String(length=255), nullable=False),
        sa.Column("text_en", sa.Text(), nullable=False),
        sa.Column("text_ru", sa.Text(), nullable=False),
        sa.Column("category", sa.String(length=100), server_default=sa.text("'general'")),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column(
            "updated_at", sa.DateTime(), server_default=sa.func.now(), nullable=False
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("key"),
    )

    op.create_table(
        "transactions",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("user_id", sa.String(), nullable=False),
        sa.Column("type", transaction_type, nullable=False),
        sa.Column("amount", sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column("description", sa.String(), nullable=False),
        sa.Column("metadata", sa.JSON(), nullable=True),
        sa.Column(
            "created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "user_daily_counters",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("user_id", sa.String(), nullable=False),
        sa.Column("date", sa.String(), nullable=False),
        sa.Column("steps_mind", sa.Integer(), server_default=sa.text("0")),
        sa.Column("books_mind", sa.Integer(), server_default=sa.text("0")),
        sa.Column("courses_mind", sa.Integer(), server_default=sa.text("0")),
        sa.Column("subs_mind", sa.Integer(), server_default=sa.text("0")),
        sa.Column(
            "created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False
        ),
        sa.Column(
            "updated_at", sa.DateTime(), server_default=sa.func.now(), nullable=False
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "date", name="unique_user_date"),
    )
    op.create_index(
        "user_date_idx",
        "user_daily_counters",
        ["user_id", "date"],
        unique=False,
    )

    op.create_table(
        "user_rewards",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("tx_hash", sa.String(), nullable=True),
        sa.Column("user_id", sa.String(), nullable=False),
        sa.Column("action_id", sa.String(), nullable=False),
        sa.Column("mind_amount", sa.Integer(), nullable=False),
        sa.Column("idempotency_key", sa.String(), nullable=False),
        sa.Column("metadata", sa.JSON(), nullable=True),
        sa.Column(
            "timestamp", sa.DateTime(), server_default=sa.func.now(), nullable=False
        ),
        sa.Column(
            "created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("idempotency_key"),
    )
    op.create_index(
        "user_rewards_action_idx", "user_rewards", ["action_id"], unique=False
    )
    op.create_index(
        "user_rewards_timestamp_idx", "user_rewards", ["timestamp"], unique=False
    )
    op.create_index("user_rewards_user_idx", "user_rewards", ["user_id"], unique=False)

    op.create_table(
        "book_chapters",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("book_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("title_ru", sa.String(), nullable=True),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("content_ru", sa.Text(), nullable=True),
        sa.Column("order_index", sa.Integer(), nullable=False),
        sa.Column(
            "created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False
        ),
        sa.Column(
            "updated_at", sa.DateTime(), server_default=sa.func.now(), nullable=False
        ),
        sa.ForeignKeyConstraint(["book_id"], ["books.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "book_purchases",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("user_id", sa.String(), nullable=False),
        sa.Column("book_id", sa.Integer(), nullable=False),
        sa.Column(
            "purchased_at", sa.DateTime(), server_default=sa.func.now(), nullable=False
        ),
        sa.ForeignKeyConstraint(["book_id"], ["books.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "daily_challenges",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("user_id", sa.String(), nullable=False),
        sa.Column("date", sa.String(), nullable=False),
        sa.Column("target_steps", sa.Integer(), server_default=sa.text("10000")),
        sa.Column("actual_steps", sa.Integer(), server_default=sa.text("0")),
        sa.Column("completed", sa.Boolean(), server_default=sa.text("false")),
        sa.Column("reward_claimed", sa.Boolean(), server_default=sa.text("false")),
        sa.Column(
            "created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "date", name="daily_challenges_user_date_key"),
    )

    op.create_table(
        "enrollments",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("user_id", sa.String(), nullable=False),
        sa.Column("course_id", sa.Integer(), nullable=False),
        sa.Column("progress", sa.Integer(), server_default=sa.text("0")),
        sa.Column("completed_at", sa.DateTime(), nullable=True),
        sa.Column(
            "enrolled_at", sa.DateTime(), server_default=sa.func.now(), nullable=False
        ),
        sa.ForeignKeyConstraint(["course_id"], ["courses.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "channel_subscriptions",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("user_id", sa.String(), nullable=False),
        sa.Column("channel_id", sa.Integer(), nullable=False),
        sa.Column("verified", sa.Boolean(), server_default=sa.text("false")),
        sa.Column(
            "subscribed_at", sa.DateTime(), server_default=sa.func.now(), nullable=False
        ),
        sa.ForeignKeyConstraint(
            ["channel_id"], ["sponsor_channels.id"], ondelete="CASCADE"
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "course_lessons",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("course_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("title_ru", sa.String(), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("description_ru", sa.Text(), nullable=True),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("content_ru", sa.Text(), nullable=True),
        sa.Column("video_url", sa.String(), nullable=True),
        sa.Column("duration", sa.Integer(), nullable=True),
        sa.Column("order_index", sa.Integer(), nullable=False),
        sa.Column(
            "created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False
        ),
        sa.Column(
            "updated_at", sa.DateTime(), server_default=sa.func.now(), nullable=False
        ),
        sa.ForeignKeyConstraint(["course_id"], ["courses.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "book_reading_progress",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("user_id", sa.String(), nullable=False),
        sa.Column("book_id", sa.Integer(), nullable=False),
        sa.Column("current_chapter", sa.Integer(), server_default=sa.text("1")),
        sa.Column("total_chapters", sa.Integer(), nullable=False),
        sa.Column("is_completed", sa.Boolean(), server_default=sa.text("false")),
        sa.Column("completed_at", sa.DateTime(), nullable=True),
        sa.Column("reward_claimed", sa.Boolean(), server_default=sa.text("false")),
        sa.Column(
            "created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False
        ),
        sa.Column(
            "updated_at", sa.DateTime(), server_default=sa.func.now(), nullable=False
        ),
        sa.ForeignKeyConstraint(["book_id"], ["books.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "user_id",
            "book_id",
            name="book_reading_progress_user_book_key",
        ),
    )

    op.create_table(
        "course_reading_progress",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("user_id", sa.String(), nullable=False),
        sa.Column("course_id", sa.Integer(), nullable=False),
        sa.Column("current_lesson", sa.Integer(), server_default=sa.text("1")),
        sa.Column("total_lessons", sa.Integer(), nullable=False),
        sa.Column("is_completed", sa.Boolean(), server_default=sa.text("false")),
        sa.Column("completed_at", sa.DateTime(), nullable=True),
        sa.Column("reward_claimed", sa.Boolean(), server_default=sa.text("false")),
        sa.Column(
            "created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False
        ),
        sa.Column(
            "updated_at", sa.DateTime(), server_default=sa.func.now(), nullable=False
        ),
        sa.ForeignKeyConstraint(["course_id"], ["courses.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "user_id",
            "course_id",
            name="course_reading_progress_user_course_key",
        ),
    )

    op.create_table(
        "chapter_tests",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("chapter_id", sa.Integer(), nullable=False),
        sa.Column("question", sa.Text(), nullable=False),
        sa.Column("question_ru", sa.Text(), nullable=True),
        sa.Column("options", postgresql.ARRAY(sa.Text()), nullable=False),
        sa.Column("options_ru", postgresql.ARRAY(sa.Text()), nullable=True),
        sa.Column("correct_answer", sa.Integer(), nullable=False),
        sa.Column("explanation", sa.Text(), nullable=True),
        sa.Column("explanation_ru", sa.Text(), nullable=True),
        sa.Column(
            "created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False
        ),
        sa.Column(
            "updated_at", sa.DateTime(), server_default=sa.func.now(), nullable=False
        ),
        sa.ForeignKeyConstraint(["chapter_id"], ["book_chapters.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "lesson_tests",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("lesson_id", sa.Integer(), nullable=False),
        sa.Column("question", sa.Text(), nullable=False),
        sa.Column("question_ru", sa.Text(), nullable=True),
        sa.Column("options", postgresql.ARRAY(sa.Text()), nullable=False),
        sa.Column("options_ru", postgresql.ARRAY(sa.Text()), nullable=True),
        sa.Column("correct_answer", sa.Integer(), nullable=False),
        sa.Column("explanation", sa.Text(), nullable=True),
        sa.Column("explanation_ru", sa.Text(), nullable=True),
        sa.Column(
            "created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False
        ),
        sa.Column(
            "updated_at", sa.DateTime(), server_default=sa.func.now(), nullable=False
        ),
        sa.ForeignKeyConstraint(["lesson_id"], ["course_lessons.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "test_attempts",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("user_id", sa.String(), nullable=False),
        sa.Column("test_type", sa.String(), nullable=False),
        sa.Column("test_id", sa.Integer(), nullable=False),
        sa.Column("chapter_id", sa.Integer(), nullable=True),
        sa.Column("lesson_id", sa.Integer(), nullable=True),
        sa.Column("selected_answer", sa.Integer(), nullable=False),
        sa.Column("is_correct", sa.Boolean(), nullable=False),
        sa.Column(
            "attempted_at", sa.DateTime(), server_default=sa.func.now(), nullable=False
        ),
        sa.ForeignKeyConstraint(["chapter_id"], ["book_chapters.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["lesson_id"], ["course_lessons.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("test_attempts")
    op.drop_table("lesson_tests")
    op.drop_table("chapter_tests")
    op.drop_table("course_reading_progress")
    op.drop_table("book_reading_progress")
    op.drop_table("course_lessons")
    op.drop_table("channel_subscriptions")
    op.drop_table("enrollments")
    op.drop_table("daily_challenges")
    op.drop_table("book_purchases")
    op.drop_table("book_chapters")
    op.drop_index("user_rewards_user_idx", table_name="user_rewards")
    op.drop_index("user_rewards_timestamp_idx", table_name="user_rewards")
    op.drop_index("user_rewards_action_idx", table_name="user_rewards")
    op.drop_table("user_rewards")
    op.drop_index("user_date_idx", table_name="user_daily_counters")
    op.drop_table("user_daily_counters")
    op.drop_table("transactions")
    op.drop_table("text_content")
    op.drop_table("sponsor_channels")
    op.drop_table("books")
    op.drop_table("courses")
    op.drop_table("users")
    op.drop_index("IDX_session_expire", table_name="sessions")
    op.drop_table("sessions")

    transaction_type.drop(op.get_bind(), checkfirst=True)
    book_category.drop(op.get_bind(), checkfirst=True)
    course_category.drop(op.get_bind(), checkfirst=True)
