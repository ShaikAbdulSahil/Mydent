import React, { useRef, useEffect, useState } from 'react';
import {
    View,
    Animated,
    StyleSheet,
    ViewStyle,
    StyleProp,
    LayoutChangeEvent,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';

interface SkeletonProps {
    width?: number | string;
    height?: number | string;
    radius?: number;
    style?: StyleProp<ViewStyle>;
}

const Skeleton: React.FC<SkeletonProps> = ({
    width = '100%',
    height = 12,
    radius = 4,
    style,
}) => {
    const translate = useRef(new Animated.Value(0)).current;
    const [containerWidth, setContainerWidth] = useState<number | null>(null);

    useEffect(() => {
        const anim = Animated.loop(
            Animated.timing(translate, {
                toValue: 1,
                duration: 1400,
                useNativeDriver: true,
            }),
        );
        anim.start();
        return () => anim.stop();
    }, [translate]);

    const onLayout = (e: LayoutChangeEvent) => {
        const w = e.nativeEvent.layout.width;
        setContainerWidth(w);
    };

    // shimmer width relative to container
    const shimmerWidth = containerWidth ? containerWidth * 0.6 : 150;

    const translateX = translate.interpolate({
        inputRange: [0, 1],
        outputRange: [-shimmerWidth, containerWidth ? containerWidth + shimmerWidth : shimmerWidth],
    });

    const numericHeight = typeof height === 'number' ? height : undefined;

    return (
        <View
            onLayout={onLayout}
            style={[
                styles.container,
                ({ width, height: numericHeight ?? height, borderRadius: radius } as ViewStyle),
                style,
            ]}
        >
            <View style={[StyleSheet.absoluteFill, { backgroundColor: Colors.skeletonBg, borderRadius: radius }]} />

            {containerWidth !== null && (
                <Animated.View
                    style={[
                        styles.shimmer,
                        {
                            width: shimmerWidth,
                            transform: [{ translateX }],
                            borderRadius: radius,
                        },
                    ]}
                    pointerEvents="none"
                >
                    <LinearGradient
                        colors={[
                            'rgba(255,255,255,0)',
                            'rgba(255,255,255,0.7)',
                            'rgba(255,255,255,0)',
                        ]}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        style={StyleSheet.absoluteFill}
                    />
                </Animated.View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
        backgroundColor: Colors.skeletonBg,
    },
    shimmer: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
    },
});

export default Skeleton;