#!/bin/bash

krpanotools_dir="krpano-1.19-pr8"
framerate=2
qscale=1 # 1-31 (1:highest, 32:lowest)
output_dir="generated"

if [ "$1" = "" ]; then
  echo 'ERROR! video file missing'
  echo 'Usage: ./create_vtour.sh videofile'
  exit
fi

function exit_on_error ()
{
  if [ $? -gt 0 ]; then
    exit $?
  fi
}

if [ ! -d $output_dir ]; then
  mkdir -p $output_dir
  exit_on_error
  echo 'created output directory.'
fi

echo 'converting video file into image pictures...'
ffmpeg -i $1 -r $framerate -ss 00:00:0 -vcodec mjpeg -qscale $qscale -qmin $qscale -qmax $qscale "generated/%4d.jpg"
exit_on_error
echo 'finished.'

echo 'converting map.json into data.json and unstaging images...'
ruby create_map.rb -o data.json --framerate $framerate --unstage
exit_on_error
echo 'finished.'

echo 'creating virtual tour...'
./${krpanotools_dir}/krpanotools makepano -config=${krpanotools_dir}/templates/vtour-normal.config ${output_dir}/*.jpg
exit_on_error
echo 'finished.'

echo 'editing tour.html...'
cp ${output_dir}/vtour/tour.html ${output_dir}/vtour/tour.orig.html
exit_on_error
sed -e "s/<\/script>/<\/script><script src='jquery-3.1.1.min.js'><\/script><script src='walkable.js'><\/script>/" ${output_dir}/vtour/tour.orig.html > ${output_dir}/vtour/tour.html
exit_on_error
echo 'done.'

echo 'editing tour.xml...'
cp ${output_dir}/vtour/tour.xml ${output_dir}/vtour/tour.orig.xml
exit_on_error
sed -e "s/<include url=\"skin\/vtourskin.xml\" \/>/<include url=\"skin\/vtourskin.xml\" \/><include url='walkable.xml' \/>/" ${output_dir}/vtour/tour.orig.xml | sed -e "s/<\/action>/hideArrows();loadJson();<\/action>/" > ${output_dir}/vtour/tour.xml
exit_on_error
echo 'done.'

echo 'copying data.json...'
cp data.json ${output_dir}/vtour/
exit_on_error
rm data.json
exit_on_error
echo 'done.'

echo 'copying files...'
cp add_files/walkable.js ${output_dir}/vtour/
exit_on_error
cp add_files/walkable.xml ${output_dir}/vtour/
exit_on_error
cp add_files/arrow.png ${output_dir}/vtour/
exit_on_error
cp add_files/jquery-3.1.1.min.js ${output_dir}/vtour/
exit_on_error
echo 'done.'

echo 'completed successfully.'
