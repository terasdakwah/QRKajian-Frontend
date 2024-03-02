from flask import Flask, render_template, redirect
from flask_mongoengine2 import MongoEngine
from datetime import datetime


app = Flask(__name__)
app.config.from_object('config')
db = MongoEngine()
db.init_app(app)


class User(db.Document):
    password = db.StringField()
    tipe = db.IntField()
    name    = db.StringField()
    no_hp   = db.StringField()
    tanggallahir = db.DateTimeField(default=datetime.strptime("1945-08-17", "%Y-%m-%d"))
    gender = db.StringField(default="")
    provinsi     = db.ObjectIdField(default=None)
    kabupaten    = db.ObjectIdField(default=None)
    kecamatan    = db.ObjectIdField(default=None)
    pekerjaaan = db.StringField(default="")
    instansi = db.StringField(default="")
    hobi = db.StringField(default="")
    poin = db.IntField(default=0)
    sedekah = db.BooleanField(default=False)

    created    = db.DateTimeField(default=datetime.strptime("1945-08-17", "%Y-%m-%d"))
    modified   = db.DateTimeField(default=datetime.strptime("1945-08-17", "%Y-%m-%d"))


@app.route('/decoder.js')
def decoderjs():
    return app.send_static_file("js/decoder.js")


@app.route('/')
@app.route('/<token_id>')
def index(token_id=None):
    if not token_id:
        return redirect("https://daftar.terasdakwah.com")
    _user = User.objects(id=token_id).first()
    if not _user:
        return redirect("https://daftar.terasdakwah.com")

    return render_template('index.html', token_id=token_id)
