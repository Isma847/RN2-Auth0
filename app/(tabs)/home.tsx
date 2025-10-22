import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface Usuario {
  email: string;
  nombre: string;
  telefono: string;
  foto: string;
  direccion: string;
  documento: string;
}

export default function Home() {
    const router = useRouter();
    const { email } = useLocalSearchParams();
    const API_URL = 'http://10.0.9.211:3000/usuario';
    
    const [usuario, setUsuario] = useState<Usuario | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState<Partial<Usuario>>({});

    useEffect(() => {
        obtenerUsuario();
        solicitarPermisos();
    }, []);

    const solicitarPermisos = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert('Se necesitan permisos para acceder a la galería');
        }
    };

    const seleccionarFoto = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
            });

            if (!result.canceled) {
                setEditedData({...editedData, foto: result.assets[0].uri});
            }
        } catch (error) {
            console.error('Error al seleccionar foto:', error);
            alert('Error al seleccionar la foto');
        }
    };

    const tomarFoto = async () => {
        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                alert('Se necesitan permisos para usar la cámara');
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
            });

            if (!result.canceled) {
                setEditedData({...editedData, foto: result.assets[0].uri});
            }
        } catch (error) {
            console.error('Error al tomar foto:', error);
            alert('Error al tomar la foto');
        }
    };

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
                // Volver a obtener el usuario actualizado de la BD
                await obtenerUsuario();
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
                {/* Foto de perfil */}
                <View style={styles.fotoContainer}>
                    {(isEditing ? editedData.foto : usuario.foto) ? (
                        <Image 
                            source={{ uri: isEditing ? editedData.foto : usuario.foto }}
                            style={styles.fotoPerfil}
                        />
                    ) : (
                        <View style={styles.fotoPlaceholder}>
                            <Text style={styles.fotoPlaceholderText}>Sin foto</Text>
                        </View>
                    )}
                </View>

                {isEditing && (
                    <View style={styles.fotoButtonsContainer}>
                        <TouchableOpacity 
                            style={styles.fotoBoton}
                            onPress={seleccionarFoto}
                        >
                            <Text style={styles.fotoBotonTexto}>Galería</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.fotoBoton}
                            onPress={tomarFoto}
                        >
                            <Text style={styles.fotoBotonTexto}>Cámara</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <Text style={styles.label}>Email:</Text>
                <Text style={styles.emailText}>{usuario.email}</Text>

                <Text style={styles.label}>Nombre:</Text>
                {isEditing ? (
                    <TextInput
                        style={styles.input}
                        value={editedData.nombre}
                        onChangeText={(text) => setEditedData({...editedData, nombre: text})}
                        placeholder="Nombre"
                        placeholderTextColor="#666"
                    />
                ) : (
                    <Text style={styles.infoText}>{usuario.nombre || 'No especificado'}</Text>
                )}

                <Text style={styles.label}>Teléfono:</Text>
                {isEditing ? (
                    <TextInput
                        style={styles.input}
                        value={editedData.telefono}
                        onChangeText={(text) => setEditedData({...editedData, telefono: text})}
                        placeholder="Teléfono"
                        placeholderTextColor="#666"
                        keyboardType="phone-pad"
                    />
                ) : (
                    <Text style={styles.infoText}>{usuario.telefono || 'No especificado'}</Text>
                )}

                <Text style={styles.label}>Dirección:</Text>
                {isEditing ? (
                    <TextInput
                        style={styles.input}
                        value={editedData.direccion}
                        onChangeText={(text) => setEditedData({...editedData, direccion: text})}
                        placeholder="Dirección"
                        placeholderTextColor="#666"
                    />
                ) : (
                    <Text style={styles.infoText}>{usuario.direccion || 'No especificado'}</Text>
                )}

                <Text style={styles.label}>Documento:</Text>
                {isEditing ? (
                    <TextInput
                        style={styles.input}
                        value={editedData.documento}
                        onChangeText={(text) => setEditedData({...editedData, documento: text})}
                        placeholder="Documento"
                        placeholderTextColor="#666"
                        keyboardType="numeric"
                    />
                ) : (
                    <Text style={styles.infoText}>{usuario.documento || 'No especificado'}</Text>
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
    fotoContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    fotoPerfil: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 3,
        borderColor: '#2bff60',
    },
    fotoPlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#2bff60',
    },
    fotoPlaceholderText: {
        color: '#666',
        fontSize: 14,
    },
    fotoButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
        marginBottom: 20,
    },
    fotoBoton: {
        backgroundColor: '#333',
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#2bff60',
    },
    fotoBotonTexto: {
        color: '#2bff60',
        fontSize: 14,
        fontWeight: 'bold',
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