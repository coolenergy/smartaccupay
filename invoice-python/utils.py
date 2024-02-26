import datetime
import time

def get_current_epoch():
    return int(time.mktime(datetime.datetime.now().timetuple()))

def parse_file_path(fileURL):
    result = fileURL.split("/")
    sub_result = result[2].split(".")
    sub_url = []
    end_point = []

    for i in range(4, len(result)):
        sub_url.append(result[i])

    for i in range(0, 3):
        end_point.append(result[i])

    res = {
        "region": sub_result[1],
        "bucket": result[3],
        "path": "/".join(sub_url),
        "endpoint": "/".join(end_point),
    }

    return res

def convert_epoch(date):
    try:
        datetime.datetime.strptime(date.replace(" ", ""), '%Y-%m-%d')
    except:
        return 0
    else:
        date_obj = datetime.datetime.strptime(date.replace(" ", ""), '%Y-%m-%d')
        return int(time.mktime(date_obj.timetuple()))
    
def remove_first_space(str):
    arr = str.split(" ")
    li = []
    for item in arr:
        if (item != ""):
            li.append(item)

    return " ".join(li)