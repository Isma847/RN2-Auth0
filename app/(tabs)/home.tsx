import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface Usuario {
  email: string;
  name: string;
  photo: string;
}

export default function Home() {
    const router = useRouter();
    const { email } = useLocalSearchParams();
    const API_URL = 'http://192.168.100.227:3000/usuario';
    
    const [usuario, setUsuario] = useState<Usuario | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState<Partial<Usuario>>({});

    useEffect(() => {
        obtenerUsuario();
    }, []);

    const obtenerUsuario = async () => {
        try {
            const response = await fetch(`${API_URL}?email=${email}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const resultado = await response.json();
            if (response.ok) {
                setUsuario(resultado);
                setEditedData(resultado);
            } else {
                console.log('Error al obtener usuario:', resultado);
            }
        } catch (error) {
            console.error('Error de conexión:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const actualizarUsuario = async () => {
        try {
            const response = await fetch(`${API_URL}?email=${email}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editedData),
            });
            const resultado = await response.json();
            if (response.ok) {
                setUsuario(resultado); 
                setEditedData(resultado);
                setIsEditing(false);
                alert('Usuario actualizado correctamente');
            } else {
                console.log('Error al actualizar:', resultado);
                alert('Error al actualizar usuario');
            }
        } catch (error) {
            console.error('Error de conexión:', error);
            alert('Error de conexión');
        }
    };

    if (isLoading) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color="#2bff60" />
            </View>
        );
    }

    if (!usuario) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <Text style={styles.errorText}>No se pudo cargar el usuario</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <Text style={styles.titulo}>Perfil de Usuario</Text>
            
            <View style={styles.card}>
                <Text style={styles.label}>Email:</Text>
                <Text style={styles.emailText}>{usuario.email}</Text>

                <Text style={styles.label}>Nombre:</Text>
                {isEditing ? (
                    <TextInput
                        style={styles.input}
                        value={editedData.name}
                        onChangeText={(text) => setEditedData({...editedData, name: text})}
                        placeholder="Nombre"
                        placeholderTextColor="#666"
                    />
                ) : (
                    <Text style={styles.infoText}>{usuario.name}</Text>
                )}

                <Text style={styles.label}>Foto:</Text>
                {isEditing ? (
                    <TextInput
                        style={styles.input}
                        value={editedData.photo}
                        onChangeText={(text) => setEditedData({...editedData, photo: text})}
                        placeholder="URL de foto"
                        placeholderTextColor="#666"
                    />
                ) : (
                    <Text style={styles.infoText}>{usuario.photo}</Text>
                )}
            </View>

            {isEditing ? (
                <View style={styles.buttonContainer}>
                    <TouchableOpacity 
                        style={styles.boton}
                        onPress={actualizarUsuario}
                    >
                        <Text style={styles.botonTexto}>Guardar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.boton, styles.botonCancelar]}
                        onPress={() => {
                            setEditedData(usuario);
                            setIsEditing(false);
                        }}
                    >
                        <Text style={styles.botonTexto}>Cancelar</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <TouchableOpacity 
                    style={styles.boton}
                    onPress={() => setIsEditing(true)}
                >
                    <Text style={styles.botonTexto}>Editar Perfil</Text>
                </TouchableOpacity>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#292929',
        flex: 1,
    },
    contentContainer: {
        flexGrow: 1,
        padding: 20,
        paddingTop: 60,
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    titulo: {
        fontSize: 35,
        textAlign: "center",
        marginBottom: 30,
        fontWeight: '700',
        color: '#2bff60',
    },
    card: {
        backgroundColor: '#1a1a1a',
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
    },
    label: {
        color: '#2bff60',
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 15,
        marginBottom: 5,
    },
    emailText: {
        color: '#a0a0a0',
        fontSize: 16,
        marginBottom: 10,
    },
    infoText: {
        color: '#e0e0e0',
        fontSize: 16,
        marginBottom: 10,
    },
    input: {
        backgroundColor: '#333',
        color: '#fff',
        padding: 12,
        borderRadius: 8,
        fontSize: 16,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#2bff60',
    },
    buttonContainer: {
        gap: 10,
    },
    boton: {
        alignSelf: "center",
        backgroundColor: "#2bff60",
        padding: 15,
        paddingHorizontal: 35,
        borderRadius: 10,
        width: '80%',
    },
    botonCancelar: {
        backgroundColor: "#666",
    },
    botonTexto: {
        letterSpacing: 1,
        color: 'black',
        fontWeight: 'bold',
        fontSize: 16,
        textAlign: 'center',
    },
    errorText: {
        color: '#ff4444',
        fontSize: 18,
    },
});