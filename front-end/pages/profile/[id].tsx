import React, { useState, useEffect, ChangeEvent} from "react";
import { useRouter } from "next/router";
import styles from "../../styles/ProfilePage.module.css"

interface User {
    _id: string;
    name: string;
    email: string;
    company?: string;
    avatarBase64?: string;
}

const ProfilePage: React.FC = () => {
    const router = useRouter();
    const { id } = router.query;

    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = () => setAvatarPreview(reader.result as string);
        reader.readAsDataURL(file);
        }
    };

    const handleAvatarUpload = async () => {
        const input = document.getElementById("avatarInput") as HTMLInputElement;
        if (!input.files || !input.files[0] || !id) return;

        const file = input.files[0];
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch(`http://localhost:8000/users/${id}/avatar`, {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            console.log("Upload success:", data);


            setAvatarPreview(`data:image/jpeg;base64,${data.avatarBase64}`);
            setUser(prev => prev ? { ...prev, avatarBase64: data.avatarBase64 } : prev);
        } catch (err) {
            console.error("Error uploading avatar:", err);
        }
    };


    useEffect(() => {
        if (!id) return;

        const fetchUser = async () => {
            try {
                const res = await fetch(`http://localhost:8000/users/${id}`);
                if (!res.ok) throw new Error("User not found");
                const data = await res.json();
                setUser(data);
                if (data.avatarBase64) {
                    setAvatarPreview(`data:image/jpeg;base64,${data.avatarBase64}`);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
            };

            fetchUser();
        }, [id]);

    if (loading) return <div className={styles.profileContainer}>Loading...</div>
    if (!user) return <div className={styles.profileContainer}>User not found.</div>

    const [firstName, lastName] = user.name.split(" ");
  return (
    <div className={styles.profileContainer}>
        <div className={styles.fieldAvatar}>
            <div className={styles.fields}>
                <div className={styles.row}>
                    <div className={styles.strField}>
                        <label>First Name</label>
                        <input type="text" className={styles.firstName} value={firstName}></input>
                    </div>
                    <div className={styles.strField}>
                        <label>Last Name</label>
                        <input type="text" className={styles.lastName} value={lastName}></input>
                    </div>
                </div>

                <div className={styles.row}>
                    <div className={styles.strField}>
                        <label>Email</label>
                        <input type="text" className={styles.email} value={user.email}></input>
                    </div>
                    <div className={styles.strField}>
                        <label>Company</label>
                        <input type="text" className={styles.company} value={user.company || ""}></input>
                    </div>
                </div>
            </div>
            <div className={styles.avatarSection}>
                <label className={styles.avatar}>Avatar</label>
                <div className={styles.avatarCircle}>
                    {avatarPreview ? (
                        <img src={avatarPreview} alt="Avatar" />
                    ) : (
                        <span className={styles.avatarPlaceholder}></span>

                    )}
                </div>
                <input
                type="file"
                accept="image/*"
                className={styles.hiddenInput}
                id="avatarInput"
                onChange={handleAvatarChange}
                />
                <label 
                htmlFor="avatarInput" 
                className={styles.uploadBtn} 
                onClick={handleAvatarUpload}>Upload</label>
            </div>

            </div>
    </div>
  );
};

export default ProfilePage;
