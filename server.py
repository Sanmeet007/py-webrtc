<<<<<<< HEAD
from pprint import pprint
=======
>>>>>>> 2773411a4d73f80002c47d0da1748a031c077047
from flask import Flask, render_template, render_template_string
from flask_socketio import SocketIO, send, emit
import json

app = Flask(__name__)
app.config["SECRET_KEY"] = "secret!"
socketio = SocketIO(app)

<<<<<<< HEAD

@app.route("/")
def homePage():
    return render_template("index.jinja")


@socketio.on("offer")
def on_offer(offer):
    print("someone offered a call")
    socketio.emit("offer"  , offer , broadcast=True ,include_self=False)


@socketio.on("answer")
def on_answer(answer):
    print("someone answered a call")
    socketio.emit("answer"  , answer , broadcast=True  , include_self=False)

@socketio.on("candidate")
def on_candidate(candidate):
    socketio.emit("candidate"  , candidate , broadcast=True  , include_self=False)


if __name__ == "__main__":
    socketio.run(app, debug=True, port=5500)
=======
# Blueprints
# app.register_blueprint(simple_page, url_prefix="/pages")


@app.route("/")
def home():
    return render_template("index.jinja")


@app.route("/sender")
def sender_page():
    return render_template("body.jinja", title="Sender", js_src="sender.js")


@app.route("/reciever")
def reciever_page():
    return render_template("body.jinja", title="Reciever", js_src="reciever.js")


# Server errors
# TODO implement the routes for the 404 and 505 pages
# ? By default the flask default error pages will be shown


# Socket
@socketio.on("offer")
def on_offer(data: dict):
    emit("offer", { 
                'data': data
        }, broadcast=True)
        
@socketio.on("answer")
def on_answer(data: dict):
    emit("answer", { 
                'data': data
        }, broadcast=True)


if __name__ == "__main__":
    socketio.run(app, debug=True)
>>>>>>> 2773411a4d73f80002c47d0da1748a031c077047
