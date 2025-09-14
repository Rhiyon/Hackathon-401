import React, { useState, ChangeEvent} from "react";
import styles from "../styles/ProfilePage.module.css"

const ProfilePage: React.FC = () => {
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = () => setAvatarPreview(reader.result as string);
        reader.readAsDataURL(file);
        }
    };


  return (
    <div className={styles.profileContainer}>
        <div className={styles.fieldAvatar}>
            <div className={styles.fields}>
                <div className={styles.row}>
                    <div className={styles.strField}>
                        <label>First Name</label>
                        <input type="text" className={styles.firstName}></input>
                    </div>
                    <div className={styles.strField}>
                        <label>Last Name</label>
                        <input type="text" className={styles.lastName}></input>
                    </div>
                </div>

                <div className={styles.row}>
                    <div className={styles.strField}>
                        <label>Email</label>
                        <input type="text" className={styles.email}></input>
                    </div>
                    <div className={styles.strField}>
                        <label>Company</label>
                        <input type="text" className={styles.company}></input>
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
                <label htmlFor="avatarInput" className={styles.uploadBtn}>Upload</label>
            </div>

            </div>
    </div>
  );
};

export default ProfilePage;
