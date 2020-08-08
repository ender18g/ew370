from app import db

class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    comment = db.Column(db.String(64), index=True)
    output = db.Column(db.String(120))

    def __repr__(self):
        return f"{self.comment}"

    @property    
    def serialize(self):
      return {
        'id':self.id,
        'input':self.comment,
        'output':self.output
      }