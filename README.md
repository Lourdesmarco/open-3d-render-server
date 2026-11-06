#Instalar dependencias

python3 -m venv .venv
source .venv/bin/activate

pip install -r backend/requirements.txt


#Arrancar el backend

cd backend
python run.py


#Configurar variable para blender

export BLENDER_EXECUTABLE="/Applications/Blender.app/Contents/MacOS/Blender"


#Arrancar el worker (en una nueva ventana de la terminal)

source .venv/bin/activate
cd backend
python -m app.worker
