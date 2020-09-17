from app import app
from app import db
from flask import render_template, url_for, request, jsonify, redirect
import json
from app.models import Comment


# def get_mlData():
#   with open ('app/static/brain-examples/ml_data.json','r') as f:
#     return json.load(f)

# def save_mlData(ml_data):
#   with open ('app/static/brain-examples/ml_data.json', 'w') as f:
#     json.dump(ml_data,f)
#     return True

@app.route('/')
@app.route('/index')
@app.route('/index.html')
def index():
  return render_template('index.html')

@app.route('/brain')
@app.route('/brain.html')
def brain():
  return render_template('brainex.html')

# @app.route('/mlData', methods=["GET","POST","DELETE"])
# def mlData():
#   #if someone is sending new training data, save it
#   if request.method=='POST':
#     new_item = {'input':request.form.get('comment'),'output':request.form.get('output')}
#     comment = Comment(comment=request.form.get('comment'), output=request.form.get('output'))
#     db.session.add(comment)
#     db.session.commit()
#     return redirect(url_for('brain'))
#   #if it's a delete request, delete comment from db
#   if request.method=="DELETE":
#     delete_id = int(request.args.get('id'))
#     comment = Comment.query.get(delete_id)
#     db.session.delete(comment)
#     db.session.commit()
#   mlData = [i.serialize for i in Comment.query.all()]
#   #print(mlData)
#   return jsonify(mlData)
