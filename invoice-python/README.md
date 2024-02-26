## Working Environment 
 - Install Python 3.9
 - Make CSV and JSON directories inside the project
## Run Server (Ubuntu)
```
    pip install -r requirements
    pip install virtualenv
    sudo apt-get install virtualenv
    source venv/bin/activate
    set FLASK_APP = app.py
    flask run --host=0.0.0.0
```

## Run Server (Windows)
```
    py -m venv venv
    venv\scripts\activate
    set FLASK_APP=app.py
    flask run --host=0.0.0.0
```
