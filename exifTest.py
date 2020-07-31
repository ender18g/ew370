import piexif
from random import randint
import json
image_name = '00000001.jpg'



## CLEAR THE EXIF
piexif.remove(image_name)
## LOAD THE EXIF TO DICTIONARY
full_dict = piexif.load(image_name)

#### Write new data
my_dict = {
  'lat': randint(10000,90000),
  'long': randint(10000,90000),
  'camera': 1,
  'alt': randint(100,700),
  'my_message': "this is a string"
}

exif_dict = {
  piexif.ExifIFD.UserComment:json.dumps(my_dict).encode('utf-8')
}


full_dict['Exif']=exif_dict


##print(full_dict)


exif_bytes = piexif.dump(full_dict)
piexif.insert(exif_bytes,image_name)

## LOAD THE EXIF TO DICTIONARY
exif_dict = piexif.load(image_name)

read_dict = json.loads(exif_dict['Exif'][37510])

print(read_dict)