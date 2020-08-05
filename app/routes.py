from app import app
from flask import render_template, url_for, request, jsonify
import json



def get_mlData():
  with open ('app/static/brain-examples/ml_data.json','r') as f:
    return json.load(f)

def save_mlData(ml_data):
  with open ('app/static/brain-examples/ml_data.json', 'w') as f:
    json.dump(ml_data,f)
    return True


@app.route('/')
@app.route('/index')
def index():
  return render_template('index.html')

@app.route('/brain',methods=["GET","POST"])
def brain():
  #load the training data
  ml_data = get_mlData();
  #if someone is sending new training data, save it
  if request.method=='POST':
    new_item = {'input':request.form.get('comment'),'output':request.form.get('output')}
    ml_data.append(new_item)
    print(new_item)
    save_mlData(ml_data)
  return render_template('brainex.html')

@app.route('/mlData')
def mlData():
  return jsonify(get_mlData())

@app.route('/mlData/remove/<i>')
def remove_mlData(i):
  i=int(i)
  ml_data=get_mlData()
  ml_data.pop(i)
  save_mlData(ml_data)
  return jsonify(get_mlData())



