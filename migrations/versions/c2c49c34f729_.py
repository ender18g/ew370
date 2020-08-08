"""empty message

Revision ID: c2c49c34f729
Revises: 
Create Date: 2020-08-07 15:32:46.009865

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'c2c49c34f729'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('comment',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('comment', sa.String(length=64), nullable=True),
    sa.Column('output', sa.String(length=120), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_comment_comment'), 'comment', ['comment'], unique=False)
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(op.f('ix_comment_comment'), table_name='comment')
    op.drop_table('comment')
    # ### end Alembic commands ###