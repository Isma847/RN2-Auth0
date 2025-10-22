import { GoogleSignin, GoogleSigninButton, isSuccessResponse } from '@react-native-google-signin/google-signin';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();
    const API_URL = 'http://192.168.100.227:3000/google-signin';

    useEffect(() => {
        GoogleSignin.configure({
            iosClientId: "471752240657-up7ek18rni69olkqs1qia41687ungk7v.apps.googleusercontent.com",
            webClientId: "471752240657-1597ckkqtbaqje2rgir5qtomikphn5am.apps.googleusercontent.com",
            profileImageSize: 150,
        });
    });

    const handleGoogleSignIn = async () => {
        try{
            setIsSubmitting(true);
            await GoogleSignin.hasPlayServices();
            const response = await GoogleSignin.signIn();
            if(isSuccessResponse(response)){
                const{idToken, user} = response.data;
                const {name, email, photo} = user;
                console.log("El usuario "+ name+" inició sesión.")
                const resultado = crearUsuarioBD(user)

                if((await resultado).success){
                    router.replace({
                    pathname: '/home', 
                    params: { email: user.email }
                });
                }
                // Mandar a la pagina de usuario con la información (name, email, photo).
            }else{
                // Mensaje de error si se cancelo el inicio de sesión.
            }
            setIsSubmitting(false);
        }catch (error) {
            // Hubo un error en el inicio de sesión.
            /*
            if(isErrorWithCode(error)){
                switch (error.code){
                case statusCode.IN_PROGRESS:
                    ...
                    break;
                case statusCode.PLAY_SERVICES_NOT_AVAILABLE:
                    ...
                    break;
                default:
                    ...
                }
            }else{
                //Mensaje de error externo a google.
                }
            */
            setIsSubmitting(false);
        }
    }

    const crearUsuarioBD = async (user: {name: any; email: any; photo: any}) =>{
        const datosParaBD = {
            nombre: user.name,
            email: user.email,
            foto: user.photo
        };
        try {
        const response = await fetch(API_URL, {
          method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
              body: JSON.stringify(datosParaBD),
            });

          const resultado = await response.text();

          if (response.ok) {
            console.log('Éxito', resultado);
            return { success: true, data: resultado };
          } else {
            console.log('Error al iniciar sesión', resultado);
            return { success: false, data: resultado };
          }
          } catch (error) {
            console.error('Error de conexión:', error);
            return { success: false, data: error };
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <Text style={styles.titulo}>Inicio de Sesión</Text>
            <View style={{marginHorizontal: 35}}>
            <GoogleSigninButton
                size={GoogleSigninButton.Size.Wide}
                color={GoogleSigninButton.Color.Dark}
                onPress={() => {handleGoogleSignIn()}}
            disabled={isSubmitting}
            />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#292929',
    },
    contentContainer: {
        flexGrow: 1,
        justifyContent: 'center'
    },
    titulo: {
        fontSize: 35,
        textAlign:"center",
        marginTop: 20,
        fontWeight: '700',
        color: '#2bff60',
        padding: 10
    },
    bienvenidoText: {
        color: '#2bff60', 
        fontSize: 20, 
        marginBottom: 10, 
        fontWeight: 'bold'
    },
    infoText: {
        color: '#e0e0e0', 
        fontSize: 16, 
        marginBottom: 5
    }
});